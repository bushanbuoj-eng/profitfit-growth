import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, Package, CreditCard, TrendingUp, Crown, Clock, CheckCircle } from "lucide-react";

export function AdminDashboard({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) {
  const { t, language } = useLanguage();
  const ar = language === "ar";

  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => (await supabase.from("profiles").select("*", { count: "exact", head: true })).count || 0,
  });

  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => (await supabase.from("products").select("*", { count: "exact", head: true })).count || 0,
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ["admin-pending-payments-count"],
    queryFn: async () => (await supabase.from("payment_requests").select("*", { count: "exact", head: true }).eq("status", "pending")).count || 0,
  });

  const { data: pendingDeposits } = useQuery({
    queryKey: ["admin-pending-deposits-count"],
    queryFn: async () => (await supabase.from("wallet_transactions").select("*", { count: "exact", head: true }).eq("status", "pending").eq("type", "deposit")).count || 0,
  });

  const { data: activeSubscriptions } = useQuery({
    queryKey: ["admin-active-subs-count"],
    queryFn: async () => (await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active")).count || 0,
  });

  // Revenue: sum of approved payment_requests + approved wallet deposits
  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data: pays } = await supabase.from("payment_requests").select("amount, created_at").eq("status", "approved");
      const { data: deps } = await supabase.from("wallet_transactions").select("amount, created_at").eq("status", "approved").eq("type", "deposit");
      const total = (pays ?? []).reduce((s, p: any) => s + Number(p.amount), 0) + (deps ?? []).reduce((s, d: any) => s + Number(d.amount), 0);
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const month = (pays ?? []).filter((p: any) => new Date(p.created_at) >= monthStart).reduce((s, p: any) => s + Number(p.amount), 0)
        + (deps ?? []).filter((d: any) => new Date(d.created_at) >= monthStart).reduce((s, d: any) => s + Number(d.amount), 0);
      return { total, month };
    },
  });

  // Recent subscription approvals
  const { data: recentSubs } = useQuery({
    queryKey: ["admin-recent-subs"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_requests").select("*, profiles:user_id(email)").eq("status", "approved").order("updated_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  // Recent payments (any status, latest activity)
  const { data: recentActivity } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_requests").select("*, profiles:user_id(email)").order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const stats = [
    { label: ar ? "إجمالي الإيرادات" : "Total Revenue", value: `$${(revenue?.total ?? 0).toFixed(2)}`, icon: DollarSign, accent: true },
    { label: ar ? "إيرادات هذا الشهر" : "This Month", value: `$${(revenue?.month ?? 0).toFixed(2)}`, icon: TrendingUp, accent: true },
    { label: t("admin.total_users"), value: userCount ?? "—", icon: Users },
    { label: ar ? "اشتراكات نشطة" : "Active Subscriptions", value: activeSubscriptions ?? "—", icon: Crown },
    { label: t("admin.total_products"), value: productCount ?? "—", icon: Package },
    { label: ar ? "مدفوعات معلقة" : "Pending Payments", value: pendingPayments ?? "—", icon: CreditCard },
    { label: ar ? "إيداعات معلقة" : "Pending Deposits", value: pendingDeposits ?? "—", icon: Clock },
  ];

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[s] || ""}`}>{s}</span>;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold gold-text-gradient">{t("admin.dashboard")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-primary/40 bg-primary/5 gold-glow" : "border-border bg-card"}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.accent ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-3xl font-bold ${s.accent ? "gold-text-gradient" : "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">{ar ? "آخر الاشتراكات" : "Recent Subscriptions"}</h2>
          </div>
          {recentSubs?.length === 0 ? (
            <p className="text-sm text-muted-foreground">{ar ? "لا يوجد بعد" : "None yet"}</p>
          ) : (
            <ul className="space-y-2">
              {recentSubs?.map((s: any) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-secondary p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{s.profiles?.email || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{s.tier} • ${s.amount}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">{ar ? "أحدث المدفوعات" : "Latest Payments"}</h2>
          </div>
          {recentActivity?.length === 0 ? (
            <p className="text-sm text-muted-foreground">{ar ? "لا يوجد بعد" : "None yet"}</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity?.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-secondary p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{a.profiles?.email || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.tier} • ${a.amount} • {a.method}</p>
                  </div>
                  {statusBadge(a.status)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
