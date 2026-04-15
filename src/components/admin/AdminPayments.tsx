import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminPayments() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_requests")
        .select("*, profiles:user_id(email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleAction = async (id: string, userId: string, status: "approved" | "rejected", tier?: string) => {
    const { error } = await supabase
      .from("payment_requests")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (status === "approved" && tier) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from("subscriptions").insert({
        user_id: userId,
        tier,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    queryClient.invalidateQueries({ queryKey: ["admin-pending-payments-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-active-subs-count"] });
    toast({ title: status === "approved" ? (language === "ar" ? "تمت الموافقة" : "Approved") : (language === "ar" ? "تم الرفض" : "Rejected") });
  };

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
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[s]}`}>{labels[s]?.[language] || s}</span>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{language === "ar" ? "طلبات الدفع" : "Payment Requests"}</h1>
      {isLoading ? (
        <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "العميل" : "Customer"}</TableHead>
                <TableHead>{language === "ar" ? "الخطة" : "Plan"}</TableHead>
                <TableHead>{language === "ar" ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{language === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-foreground">{p.profiles?.email || "—"}</TableCell>
                  <TableCell className="text-foreground capitalize">{p.tier}</TableCell>
                  <TableCell className="text-foreground">${p.amount}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gold-gradient text-primary-foreground"
                          onClick={() => handleAction(p.id, p.user_id, "approved", p.tier)}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" /> {language === "ar" ? "موافقة" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(p.id, p.user_id, "rejected")}
                        >
                          <XCircle className="mr-1 h-3 w-3" /> {language === "ar" ? "رفض" : "Reject"}
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
