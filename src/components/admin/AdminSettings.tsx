import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsapp, setWhatsapp] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bank, setBank] = useState("");
  const [paybill, setPaybill] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setWhatsapp(settings.find((s) => s.key === "whatsapp_number")?.value ?? "");
      setInstructions(settings.find((s) => s.key === "manual_payment_instructions")?.value ?? "");
      setBank(settings.find((s) => s.key === "bank_details")?.value ?? "");
      setPaybill(settings.find((s) => s.key === "paybill_details")?.value ?? "");
    }
  }, [settings]);

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("admin_settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      return supabase.from("admin_settings").update({ value }).eq("key", key);
    }
    return supabase.from("admin_settings").insert({ key, value });
  };

  const handleSave = async () => {
    const results = await Promise.all([
      upsertSetting("whatsapp_number", whatsapp),
      upsertSetting("manual_payment_instructions", instructions),
      upsertSetting("bank_details", bank),
      upsertSetting("paybill_details", paybill),
    ]);
    const err = results.find((r) => r.error);
    if (err?.error) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: err.error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    queryClient.invalidateQueries({ queryKey: ["whatsapp-number"] });
    queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
    toast({ title: language === "ar" ? "تم الحفظ" : "Saved" });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">
        {language === "ar" ? "الإعدادات" : "Settings"}
      </h1>

      <div className="max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {language === "ar" ? "رقم واتساب" : "WhatsApp Number"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "ar"
              ? "رقم واتساب الذي سيتواصل معه العملاء للدفع والدعم"
              : "WhatsApp number customers will contact for payment and support"}
          </p>
          <div className="space-y-3">
            <Label>{language === "ar" ? "رقم الهاتف (مع رمز الدولة)" : "Phone Number (with country code)"}</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1234567890" className="bg-secondary" dir="ltr" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{language === "ar" ? "تعليمات الدفع اليدوي" : "Manual Payment Instructions"}</h2>
          <Label>{language === "ar" ? "تعليمات للعميل" : "Instructions shown to customer"}</Label>
          <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="bg-secondary" />
          <Label>{language === "ar" ? "تفاصيل البنك" : "Bank Details"}</Label>
          <Textarea value={bank} onChange={(e) => setBank(e.target.value)} rows={4} className="bg-secondary font-mono text-xs" dir="ltr" />
          <Label>{language === "ar" ? "تفاصيل Paybill" : "Paybill / Mobile Money"}</Label>
          <Textarea value={paybill} onChange={(e) => setPaybill(e.target.value)} rows={3} className="bg-secondary font-mono text-xs" dir="ltr" />
        </div>

        <Button className="gold-gradient text-primary-foreground w-full" onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" /> {language === "ar" ? "حفظ كل الإعدادات" : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
