import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, CreditCard, MessageCircle, Settings, Wallet, Megaphone, MessagesSquare } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminWallets } from "@/components/admin/AdminWallets";
import { AdminCustomerCare } from "@/components/admin/AdminCustomerCare";
import { AdminChat } from "@/components/admin/AdminChat";
import { AdminAnnouncements } from "@/components/admin/AdminAnnouncements";
import { AdminSettings } from "@/components/admin/AdminSettings";

type Tab = "dashboard" | "customers" | "products" | "payments" | "wallets" | "chat" | "announcements" | "care" | "settings";

const Admin = () => {
  const { t, language } = useLanguage();
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs = [
    { key: "dashboard" as Tab, icon: LayoutDashboard, label: t("admin.dashboard") },
    { key: "customers" as Tab, icon: Users, label: t("admin.customers") },
    { key: "products" as Tab, icon: Package, label: t("admin.products") },
    { key: "payments" as Tab, icon: CreditCard, label: language === "ar" ? "المدفوعات" : "Payments" },
    { key: "wallets" as Tab, icon: Wallet, label: language === "ar" ? "المحافظ" : "Wallets" },
    { key: "chat" as Tab, icon: MessagesSquare, label: language === "ar" ? "المحادثات" : "Chats" },
    { key: "announcements" as Tab, icon: Megaphone, label: language === "ar" ? "الإعلانات" : "Announcements" },
    { key: "care" as Tab, icon: MessageCircle, label: language === "ar" ? "واتساب" : "WhatsApp" },
    { key: "settings" as Tab, icon: Settings, label: language === "ar" ? "الإعدادات" : "Settings" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-16 border-r border-border bg-card md:w-56">
        <nav className="flex flex-col gap-1 p-2">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                tab === tb.key ? "gold-gradient text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tb.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">{tb.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "products" && <AdminProducts />}
        {tab === "payments" && <AdminPayments />}
        {tab === "wallets" && <AdminWallets />}
        {tab === "chat" && <AdminChat />}
        {tab === "announcements" && <AdminAnnouncements />}
        {tab === "care" && <AdminCustomerCare />}
        {tab === "settings" && <AdminSettings />}
      </main>
    </div>
  );
};

export default Admin;
