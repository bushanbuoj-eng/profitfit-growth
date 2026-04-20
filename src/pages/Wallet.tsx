import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wallet as WalletIcon, Upload, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const Wallet = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const ar = language === "ar";
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["wallet-balance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("wallet_balances").select("balance").eq("user_id", user!.id).maybeSingle();
      return Number(data?.balance ?? 0);
    },
  });

  const { data: txs } = useQuery({
    queryKey: ["wallet-tx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("wallet_transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast({ title: ar ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount", variant: "destructive" }); return; }
    if (!file) { toast({ title: ar ? "ارفع إثبات الدفع" : "Upload payment evidence", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-evidence").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("wallet_transactions").insert({
        user_id: user.id, amount: amt, type: "deposit", status: "pending", evidence_url: path, method: "manual",
      });
      if (error) throw error;
      toast({ title: ar ? "تم الإرسال" : "Submitted", description: ar ? "في انتظار الموافقة" : "Awaiting approval" });
      setAmount(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["wallet-tx", user.id] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const statusIcon = (s: string) => s === "approved" ? <CheckCircle className="h-4 w-4 text-green-500" /> : s === "rejected" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold gold-text-gradient">{ar ? "المحفظة" : "Wallet"}</h1>

      <Card className="mb-6 gold-glow border-primary/30 p-6">
        <div className="flex items-center gap-4">
          <WalletIcon className="h-10 w-10 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "الرصيد المتاح" : "Available balance"}</p>
            <p className="text-4xl font-bold gold-text-gradient">${(balance ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{ar ? "إيداع أموال" : "Deposit funds"}</h2>
        <div className="space-y-3">
          <div>
            <Label>{ar ? "المبلغ ($)" : "Amount ($)"}</Label>
            <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>{ar ? "إثبات الدفع" : "Payment evidence"}</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button className="w-full gold-gradient text-primary-foreground" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {ar ? "إرسال للموافقة" : "Submit for Approval"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{ar ? "السجل" : "History"}</h2>
        {!txs?.length ? <p className="text-sm text-muted-foreground">{ar ? "لا توجد معاملات" : "No transactions yet"}</p> : (
          <div className="space-y-2">
            {txs.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  {statusIcon(t.status)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.type === "deposit" ? (ar ? "إيداع" : "Deposit") : (ar ? "خصم" : "Debit")} ${Number(t.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-xs capitalize text-muted-foreground">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Wallet;
