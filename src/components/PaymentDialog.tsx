import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Wallet, Building2, Globe, Upload, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  tier: string;
  onSuccess?: () => void;
}

export function PaymentDialog({ open, onOpenChange, amount, tier, onSuccess }: PaymentDialogProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const ar = language === "ar";
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("*").in("key", ["manual_payment_instructions", "bank_details", "paybill_details"]);
      return Object.fromEntries((data ?? []).map((s) => [s.key, s.value])) as Record<string, string>;
    },
  });

  const stripeStub = (method: string) => () => {
    toast({
      title: ar ? "نظام الدفع غير مهيأ بعد" : "Payment system not configured yet",
      description: ar ? `${method} سيتم تفعيله قريباً.` : `${method} will be enabled soon.`,
    });
  };

  const submitManual = async () => {
    if (!user) return;
    if (!file) {
      toast({ title: ar ? "مطلوب" : "Required", description: ar ? "يرجى رفع إثبات الدفع" : "Please upload payment evidence", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-evidence").upload(path, file);
      if (upErr) throw upErr;

      const { error } = await supabase.from("payment_requests").insert({
        user_id: user.id,
        tier,
        amount,
        method: "manual",
        evidence_url: path,
        admin_note: note || null,
      });
      if (error) throw error;

      toast({ title: ar ? "تم الإرسال" : "Submitted", description: ar ? "في انتظار موافقة المسؤول" : "Pending admin approval" });
      qc.invalidateQueries({ queryKey: ["pending-payment"] });
      onSuccess?.();
      onOpenChange(false);
      setFile(null);
      setNote("");
    } catch (e: any) {
      toast({ title: ar ? "خطأ" : "Error", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="gold-text-gradient">{ar ? "إتمام الدفع" : "Complete Payment"}</DialogTitle>
          <DialogDescription>
            {ar ? `المبلغ: $${amount} — خطة ${tier}` : `Amount: $${amount} — ${tier} plan`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="card" className="mt-2">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="card"><CreditCard className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="wise"><Globe className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="bank"><Building2 className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="manual"><Wallet className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-3 pt-4">
            <div className="space-y-2">
              <Label>{ar ? "رقم البطاقة" : "Card Number"}</Label>
              <Input placeholder="4242 4242 4242 4242" disabled />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="MM/YY" disabled />
              <Input placeholder="CVC" disabled />
            </div>
            <Button className="w-full gold-gradient text-primary-foreground" onClick={stripeStub("Stripe")}>
              {ar ? `ادفع $${amount}` : `Pay $${amount}`}
            </Button>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">{ar ? "الدفع عبر PayPal" : "Pay with PayPal"}</p>
            <Button className="w-full bg-[#0070ba] text-white hover:bg-[#005ea6]" onClick={stripeStub("PayPal")}>
              {ar ? "متابعة إلى PayPal" : "Continue to PayPal"}
            </Button>
          </TabsContent>

          <TabsContent value="wise" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">{ar ? "تحويل دولي عبر Wise" : "International transfer via Wise"}</p>
            <Button className="w-full bg-[#9fe870] text-black hover:opacity-90" onClick={stripeStub("Wise")}>
              {ar ? "متابعة إلى Wise" : "Continue to Wise"}
            </Button>
          </TabsContent>

          <TabsContent value="bank" className="space-y-3 pt-4">
            <pre className="whitespace-pre-wrap rounded-md border border-border bg-secondary p-3 text-xs text-foreground">
              {settings?.bank_details || "Bank details not set"}
            </pre>
            <Button className="w-full" variant="outline" onClick={stripeStub("Bank Transfer")}>
              {ar ? "تأكيد التحويل" : "Confirm Transfer"}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 pt-4">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <p className="mb-2 font-semibold text-primary">{ar ? "تعليمات الدفع" : "Payment Instructions"}</p>
              <p className="whitespace-pre-wrap text-foreground/80">{settings?.manual_payment_instructions}</p>
              {settings?.paybill_details && <pre className="mt-2 whitespace-pre-wrap text-foreground/70">{settings.paybill_details}</pre>}
            </div>
            <div className="space-y-2">
              <Label>{ar ? "إثبات الدفع (صورة/PDF)" : "Payment evidence (image/PDF)"}</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Textarea placeholder={ar ? "ملاحظة (اختياري)" : "Note (optional)"} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button className="w-full gold-gradient text-primary-foreground" onClick={submitManual} disabled={uploading || !file}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {ar ? "إرسال للموافقة" : "Submit for Approval"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
