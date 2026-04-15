import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function AdminDashboard() {
  const { t, language } = useLanguage();

  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ["admin-pending-payments-count"],
    queryFn: async () => {
      const { count } = await supabase.from("payment_requests").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  const { data: activeSubscriptions } = useQuery({
    queryKey: ["admin-active-subs-count"],
    queryFn: async () => {
      const { count } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
      return count || 0;
    },
  });

  const stats = [
    { label: t("admin.total_users"), value: userCount ?? "—" },
    { label: t("admin.total_products"), value: productCount ?? "—" },
    { label: language === "ar" ? "مدفوعات معلقة" : "Pending Payments", value: pendingPayments ?? "—" },
    { label: language === "ar" ? "اشتراكات نشطة" : "Active Subscriptions", value: activeSubscriptions ?? "—" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{t("admin.dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6 gold-glow">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-4xl font-bold gold-text-gradient">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
