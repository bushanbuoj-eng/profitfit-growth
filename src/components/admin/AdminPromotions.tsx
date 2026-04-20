import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminPromotions() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const qc = useQueryClient();

  const { data: promos, isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((p: any) => p.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,email").in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.email]));
      return (data ?? []).map((p: any) => ({ ...p, email: map.get(p.user_id) }));
    },
  });

  const decide = async (promo: any, status: "approved" | "rejected") => {
    const update: any = { status };
    if (status === "approved") {
      update.published_at = new Date().toISOString();
      const exp = new Date(); exp.setDate(exp.getDate() + 30);
      update.expires_at = exp.toISOString();
    }
    const { error } = await supabase.from("promotions").update(update).eq("id", promo.id);
    if (error) { toast.error(error.message); return; }

    // Refund wallet on rejection
    if (status === "rejected") {
      const { data: bal } = await supabase.from("wallet_balances").select("balance").eq("user_id", promo.user_id).maybeSingle();
      const newBal = Number(bal?.balance ?? 0) + Number(promo.price);
      await supabase.from("wallet_balances").upsert({ user_id: promo.user_id, balance: newBal, updated_at: new Date().toISOString() });
      await supabase.from("wallet_transactions").insert({
        user_id: promo.user_id, amount: promo.price, type: "deposit", status: "approved",
        note: `Refund: ${promo.title}`,
      });
    }

    await supabase.from("notifications").insert({
      user_id: promo.user_id,
      title: status === "approved" ? (ar ? "إعلانك منشور" : "Your promotion is live") : (ar ? "تم رفض إعلانك" : "Promotion rejected"),
      body: promo.title,
      link: "/marketing",
    });

    toast.success(ar ? "تم التحديث" : "Updated");
    qc.invalidateQueries({ queryKey: ["admin-promotions"] });
  };

  const badge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600",
      approved: "bg-green-500/20 text-green-600",
      rejected: "bg-red-500/20 text-red-600",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[s] || ""}`}>{s}</span>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{ar ? "الإعلانات التسويقية" : "Marketing Promotions"}</h1>
      {isLoading ? <p className="text-muted-foreground">...</p> : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar ? "صورة" : "Image"}</TableHead>
                <TableHead>{ar ? "العميل" : "User"}</TableHead>
                <TableHead>{ar ? "العنوان" : "Title"}</TableHead>
                <TableHead>{ar ? "الوصف" : "Description"}</TableHead>
                <TableHead>{ar ? "السعر" : "Price"}</TableHead>
                <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                <TableHead>{ar ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.image_url ? <img src={p.image_url} alt={p.title} className="h-10 w-10 rounded object-cover" /> : "—"}</TableCell>
                  <TableCell className="text-xs">{p.email || "—"}</TableCell>
                  <TableCell className="text-foreground">{p.title}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">{p.description}</TableCell>
                  <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{badge(p.status)}</TableCell>
                  <TableCell>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => decide(p, "approved")}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => decide(p, "rejected")}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!promos?.length && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{ar ? "لا توجد إعلانات" : "No promotions yet"}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
