import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Truck, PackageCheck } from "lucide-react";

const STATUSES = ["pending", "approved", "shipped", "delivered", "rejected"] as const;

export function AdminOrders() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const qc = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (order: any, status: typeof STATUSES[number]) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Refund wallet if rejected
    if (status === "rejected" && order.paid_from_wallet) {
      const { data: bal } = await supabase.from("wallet_balances").select("balance").eq("user_id", order.user_id).maybeSingle();
      const newBal = Number(bal?.balance ?? 0) + Number(order.total);
      await supabase.from("wallet_balances").upsert({ user_id: order.user_id, balance: newBal, updated_at: new Date().toISOString() });
      await supabase.from("wallet_transactions").insert({
        user_id: order.user_id, amount: order.total, type: "deposit", status: "approved", note: `Refund: ${order.product_name}`,
      });
    }

    // Notify user
    const titles: Record<string, { en: string; ar: string }> = {
      approved: { en: "Order approved", ar: "تمت الموافقة على الطلب" },
      shipped: { en: "Order shipped", ar: "تم شحن الطلب" },
      delivered: { en: "Order delivered", ar: "تم تسليم الطلب" },
      rejected: { en: "Order rejected", ar: "تم رفض الطلب" },
    };
    const t = titles[status];
    if (t) {
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: ar ? t.ar : t.en,
        body: `${order.product_name} × ${order.quantity}`,
        link: "/profile",
      });
    }

    toast.success(ar ? "تم التحديث" : "Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const badge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600",
      approved: "bg-blue-500/20 text-blue-600",
      shipped: "bg-purple-500/20 text-purple-600",
      delivered: "bg-green-500/20 text-green-600",
      rejected: "bg-red-500/20 text-red-600",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[s] || ""}`}>{s}</span>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{ar ? "الطلبات" : "Orders"}</h1>
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar ? "المنتج" : "Product"}</TableHead>
              <TableHead>{ar ? "الكمية" : "Qty"}</TableHead>
              <TableHead>{ar ? "المجموع" : "Total"}</TableHead>
              <TableHead>{ar ? "العنوان" : "Address"}</TableHead>
              <TableHead>{ar ? "الهاتف" : "Phone"}</TableHead>
              <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
              <TableHead>{ar ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell className="text-foreground">{o.product_name}</TableCell>
                <TableCell>{o.quantity}</TableCell>
                <TableCell>${Number(o.total).toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs">{o.address}</TableCell>
                <TableCell className="text-xs">{o.phone || "—"}</TableCell>
                <TableCell>{badge(o.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {o.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setStatus(o, "approved")}><Check className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(o, "rejected")}><X className="h-3 w-3" /></Button>
                      </>
                    )}
                    {o.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(o, "shipped")}><Truck className="h-3 w-3" /></Button>
                    )}
                    {o.status === "shipped" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(o, "delivered")}><PackageCheck className="h-3 w-3" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!orders?.length && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{ar ? "لا توجد طلبات" : "No orders yet"}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
