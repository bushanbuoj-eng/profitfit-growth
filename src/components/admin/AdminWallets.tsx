import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminWallets() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const ar = language === "ar";

  const { data: txs, isLoading } = useQuery({
    queryKey: ["admin-wallet-tx"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((t: any) => t.user_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id,email").in("id", ids)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.email]));
      return (data ?? []).map((t: any) => ({ ...t, profiles: { email: map.get(t.user_id) } }));
    },
  });

  const viewEvidence = async (path: string) => {
    const { data } = await supabase.storage.from("payment-evidence").createSignedUrl(path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handle = async (tx: any, status: "approved" | "rejected") => {
    const { error } = await supabase.from("wallet_transactions").update({ status }).eq("id", tx.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    if (status === "approved" && tx.type === "deposit") {
      // upsert balance
      const { data: cur } = await supabase.from("wallet_balances").select("balance").eq("user_id", tx.user_id).maybeSingle();
      const newBal = Number(cur?.balance ?? 0) + Number(tx.amount);
      if (cur) await supabase.from("wallet_balances").update({ balance: newBal }).eq("user_id", tx.user_id);
      else await supabase.from("wallet_balances").insert({ user_id: tx.user_id, balance: newBal });
    }

    qc.invalidateQueries({ queryKey: ["admin-wallet-tx"] });
    toast({ title: status === "approved" ? (ar ? "تمت الموافقة" : "Approved") : (ar ? "تم الرفض" : "Rejected") });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{ar ? "المحفظة - الإيداعات" : "Wallet Deposits"}</h1>
      {isLoading ? <p className="text-muted-foreground">...</p> : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar ? "العميل" : "User"}</TableHead>
                <TableHead>{ar ? "النوع" : "Type"}</TableHead>
                <TableHead>{ar ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{ar ? "إثبات" : "Evidence"}</TableHead>
                <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                <TableHead>{ar ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-foreground">{t.profiles?.email || "—"}</TableCell>
                  <TableCell className="text-foreground capitalize">{t.type}</TableCell>
                  <TableCell className="text-foreground">${Number(t.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {t.evidence_url && (
                      <Button size="sm" variant="ghost" onClick={() => viewEvidence(t.evidence_url)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell><span className="text-xs capitalize text-muted-foreground">{t.status}</span></TableCell>
                  <TableCell>
                    {t.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => handle(t, "approved")}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handle(t, "rejected")}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
