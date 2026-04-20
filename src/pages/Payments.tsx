import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const Payments = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const ar = language === "ar";

  const { data: payments } = useQuery({
    queryKey: ["my-payments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("payment_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: deposits } = useQuery({
    queryKey: ["my-deposits", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("wallet_transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</div>;
  if (!user) return <Navigate to="/login" replace />;

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    const labels: Record<string, Record<string, string>> = {
      pending: { en: "Pending", ar: "معلق" },
      approved: { en: "Approved", ar: "موافق" },
      rejected: { en: "Rejected", ar: "مرفوض" },
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[s] || ""}`}>{labels[s]?.[language] || s}</span>;
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <div className="mb-8 flex items-center gap-3">
        <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold gold-text-gradient">{ar ? "مدفوعاتي" : "My Payments"}</h1>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{ar ? "اشتراكات الخطط" : "Plan Subscriptions"}</h2>
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar ? "الخطة" : "Plan"}</TableHead>
                <TableHead>{ar ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{ar ? "الطريقة" : "Method"}</TableHead>
                <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                <TableHead>{ar ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{ar ? "لا توجد مدفوعات" : "No payments yet"}</TableCell></TableRow>
              )}
              {payments?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="capitalize text-foreground">{p.tier}</TableCell>
                  <TableCell className="text-foreground">${p.amount}</TableCell>
                  <TableCell className="capitalize text-foreground">{p.method}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">{ar ? "إيداعات المحفظة" : "Wallet Deposits"}</h2>
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar ? "النوع" : "Type"}</TableHead>
                <TableHead>{ar ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{ar ? "الطريقة" : "Method"}</TableHead>
                <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                <TableHead>{ar ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{ar ? "لا توجد إيداعات" : "No deposits yet"}</TableCell></TableRow>
              )}
              {deposits?.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="capitalize text-foreground">{d.type}</TableCell>
                  <TableCell className="text-foreground">${Number(d.amount).toFixed(2)}</TableCell>
                  <TableCell className="capitalize text-foreground">{d.method || "—"}</TableCell>
                  <TableCell>{statusBadge(d.status)}</TableCell>
                  <TableCell className="text-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default Payments;
