import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Megaphone, Upload, Wallet as WalletIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const PROMO_PRICE = 200;

export default function Marketing() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const ar = language === "ar";
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [payMethod, setPayMethod] = useState<"wallet" | "manual">("wallet");
  const [submitting, setSubmitting] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["wallet-balance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("wallet_balances").select("balance").eq("user_id", user!.id).maybeSingle();
      return Number(data?.balance ?? 0);
    },
  });

  const { data: myPromos } = useQuery({
    queryKey: ["my-promos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("promotions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error(ar ? "أدخل العنوان والوصف" : "Enter title and description");
      return;
    }
    if (payMethod === "wallet" && (balance ?? 0) < PROMO_PRICE) {
      toast.error(ar ? "رصيد المحفظة غير كافٍ" : "Insufficient wallet balance");
      return;
    }
    if (payMethod === "manual" && !evidence) {
      toast.error(ar ? "يرجى تحميل إثبات الدفع" : "Please upload payment proof");
      return;
    }
    setSubmitting(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const path = `${user.id}/${Date.now()}-${image.name}`;
        const { error: upErr } = await supabase.storage.from("promotion-images").upload(path, image);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("promotion-images").getPublicUrl(path);
        image_url = pub.publicUrl;
      }

      // Create promotion as pending
      const { data: promo, error: pErr } = await supabase
        .from("promotions")
        .insert({ user_id: user.id, title, description, image_url, price: PROMO_PRICE, status: "pending" })
        .select()
        .single();
      if (pErr) throw pErr;

      if (payMethod === "wallet") {
        // Deduct from wallet immediately, log as withdrawal
        const newBal = (balance ?? 0) - PROMO_PRICE;
        await supabase.from("wallet_balances").upsert({ user_id: user.id, balance: newBal, updated_at: new Date().toISOString() });
        await supabase.from("wallet_transactions").insert({
          user_id: user.id, amount: PROMO_PRICE, type: "withdrawal", status: "approved", method: "wallet",
          note: `Promotion: ${title}`,
        });
      } else {
        // Upload evidence and create wallet_transactions deposit (pending)
        const evPath = `${user.id}/promo-${promo.id}-${Date.now()}-${evidence!.name}`;
        const { error: evErr } = await supabase.storage.from("payment-evidence").upload(evPath, evidence!);
        if (evErr) throw evErr;
        await supabase.from("wallet_transactions").insert({
          user_id: user.id, amount: PROMO_PRICE, type: "deposit", status: "pending",
          method: "manual", evidence_url: evPath, note: `Promotion payment: ${title}`,
        });
      }

      toast.success(ar ? "تم إرسال الطلب للمراجعة" : "Submitted for review");
      setTitle(""); setDescription(""); setImage(null); setEvidence(null);
      qc.invalidateQueries({ queryKey: ["my-promos"] });
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; icon: any; en: string; ar: string }> = {
      pending: { cls: "bg-yellow-500/20 text-yellow-600", icon: Clock, en: "Pending", ar: "قيد المراجعة" },
      approved: { cls: "bg-green-500/20 text-green-600", icon: CheckCircle2, en: "Live", ar: "منشور" },
      rejected: { cls: "bg-red-500/20 text-red-600", icon: XCircle, en: "Rejected", ar: "مرفوض" },
    };
    const m = map[s] || map.pending;
    const Icon = m.icon;
    return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}><Icon className="h-3 w-3" />{ar ? m.ar : m.en}</span>;
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <BackButton className="-ml-2" />
      <div className="text-center">
        <Megaphone className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-2 text-3xl font-bold gold-text-gradient">{ar ? "تسويق منتجك" : "Promote Your Product"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ar ? `اعرض إعلانك على الصفحة الرئيسية بـ $${PROMO_PRICE} فقط. يخضع للموافقة.` : `Feature your ad on the homepage for just $${PROMO_PRICE}. Subject to admin approval.`}
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{ar ? "العنوان" : "Title"}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ar ? "اسم المنتج / الخدمة" : "Product / service name"} required />
          </div>
          <div>
            <Label>{ar ? "الوصف" : "Description"}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={ar ? "صف عرضك..." : "Describe your offer..."} required />
          </div>
          <div>
            <Label>{ar ? "صورة (اختياري)" : "Image (optional)"}</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 text-sm font-medium">{ar ? "طريقة الدفع" : "Payment Method"} — <span className="gold-text-gradient">${PROMO_PRICE}</span></p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setPayMethod("wallet")}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${payMethod === "wallet" ? "border-primary bg-primary/5" : "border-border"}`}>
                <WalletIcon className="mb-1 h-4 w-4 text-primary" />
                <p className="font-medium">{ar ? "من المحفظة" : "From Wallet"}</p>
                <p className="text-xs text-muted-foreground">{ar ? "الرصيد" : "Balance"}: ${balance?.toFixed(2) ?? "0.00"}</p>
              </button>
              <button type="button" onClick={() => setPayMethod("manual")}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${payMethod === "manual" ? "border-primary bg-primary/5" : "border-border"}`}>
                <Upload className="mb-1 h-4 w-4 text-primary" />
                <p className="font-medium">{ar ? "تحميل إثبات الدفع" : "Upload Payment Proof"}</p>
                <p className="text-xs text-muted-foreground">{ar ? "تحويل بنكي / صورة" : "Bank transfer / screenshot"}</p>
              </button>
            </div>
            {payMethod === "manual" && (
              <div className="mt-3">
                <Label>{ar ? "إثبات الدفع" : "Payment Proof"}</Label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setEvidence(e.target.files?.[0] ?? null)} required />
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full gold-gradient text-primary-foreground">
            {submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? `ادفع ${PROMO_PRICE}$ وأرسل` : `Pay $${PROMO_PRICE} & Submit`)}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{ar ? "إعلاناتي" : "My Promotions"}</h2>
        {!myPromos?.length ? (
          <p className="text-sm text-muted-foreground">{ar ? "لا توجد إعلانات بعد" : "No promotions yet"}</p>
        ) : (
          <div className="space-y-2">
            {myPromos.map((p: any) => (
              <Card key={p.id} className="flex items-center gap-3 p-3">
                {p.image_url && <img src={p.image_url} alt={p.title} className="h-14 w-14 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                </div>
                {statusBadge(p.status)}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
