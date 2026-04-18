import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: { id: string; name: string; price: number } | null;
}

export function OrderDialog({ open, onOpenChange, product }: Props) {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const ar = language === "ar";
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["wallet-balance", user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data } = await supabase.from("wallet_balances").select("balance").eq("user_id", user!.id).maybeSingle();
      return Number(data?.balance ?? 0);
    },
  });

  if (!product) return null;
  const total = product.price * qty;
  const enough = (balance ?? 0) >= total;

  const placeOrder = async () => {
    if (!user || !address.trim()) {
      toast.error(ar ? "أدخل عنوان الشحن" : "Enter shipping address");
      return;
    }
    if (!enough) {
      toast.error(ar ? "رصيد غير كافٍ" : "Insufficient balance");
      return;
    }
    setSubmitting(true);
    try {
      // Deduct from wallet (debit transaction)
      const newBalance = (balance ?? 0) - total;
      const { error: balErr } = await supabase
        .from("wallet_balances")
        .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() });
      if (balErr) throw balErr;

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: total,
        type: "debit",
        status: "approved",
        note: `Order: ${product.name} x${qty}`,
      });

      const { error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: product.price,
        total,
        address: address.trim(),
        phone: phone.trim() || null,
        paid_from_wallet: true,
        status: "pending",
      });
      if (orderErr) throw orderErr;

      toast.success(ar ? "تم تقديم الطلب" : "Order placed", {
        description: ar ? "في انتظار موافقة المسؤول" : "Awaiting admin approval",
      });
      qc.invalidateQueries({ queryKey: ["wallet-balance", user.id] });
      onOpenChange(false);
      setAddress("");
      setQty(1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="gold-text-gradient">{product.name}</DialogTitle>
          <DialogDescription>
            ${product.price} × {qty} = <span className="font-bold text-foreground">${total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-secondary p-3">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              {ar ? "رصيد المحفظة" : "Wallet balance"}
            </div>
            <span className="font-semibold text-foreground">${(balance ?? 0).toFixed(2)}</span>
          </div>

          <div>
            <Label>{ar ? "الكمية" : "Quantity"}</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
          </div>
          <div>
            <Label>{ar ? "عنوان الشحن" : "Shipping address"}</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={ar ? "الشارع، المدينة، البلد" : "Street, city, country"} />
          </div>
          <div>
            <Label>{ar ? "رقم الهاتف" : "Phone number"}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {!enough ? (
            <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {ar ? "رصيد غير كافٍ" : "Insufficient balance"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ar ? `تحتاج إلى $${(total - (balance ?? 0)).toFixed(2)} إضافية` : `You need $${(total - (balance ?? 0)).toFixed(2)} more`}
                </p>
              </div>
              <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => { onOpenChange(false); navigate("/wallet"); }}>
                {ar ? "إيداع" : "Deposit"}
              </Button>
            </div>
          ) : (
            <Button className="w-full gold-gradient text-primary-foreground" onClick={placeOrder} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ar ? "تقديم الطلب" : "Place Order"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
