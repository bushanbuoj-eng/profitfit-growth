import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu, X, Wallet, User, Settings as SettingsIcon, MessageSquare,
  CreditCard, History, LayoutDashboard, Pill, Shield, LogOut, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ar = language === "ar";

  const userMenuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/supplements", icon: Pill, label: t("nav.supplements") },
    { to: "/wallet", icon: Wallet, label: ar ? "المحفظة" : "Wallet" },
    { to: "/payments", icon: CreditCard, label: ar ? "المدفوعات" : "Payments" },
    { to: "/history", icon: History, label: ar ? "السجل" : "History" },
    { to: "/messages", icon: MessageSquare, label: ar ? "الرسائل" : "Messages" },
    { to: "/profile", icon: User, label: t("nav.profile") },
    { to: "/settings", icon: SettingsIcon, label: ar ? "الإعدادات" : "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold gold-text-gradient tracking-wider">
          PROFITFIT
        </Link>

        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <ThemeToggle />
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="rounded-md border border-primary/30 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {language === "en" ? "AR" : "EN"}
          </button>

          {/* Desktop */}
          <nav className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Menu className="h-4 w-4" />
                      {ar ? "القائمة" : "Menu"}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                        <item.icon className="mr-2 h-4 w-4" /> {item.label}
                      </DropdownMenuItem>
                    ))}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Shield className="mr-2 h-4 w-4" /> {t("nav.admin")}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>{t("nav.login")}</Button>
                <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => navigate("/signup")}>{t("nav.signup")}</Button>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background p-3 md:hidden">
          {user ? (
            <>
              {userMenuItems.map((item) => (
                <Button key={item.to} variant="ghost" className="justify-start" onClick={() => { navigate(item.to); setMenuOpen(false); }}>
                  <item.icon className="mr-2 h-4 w-4" /> {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button variant="ghost" className="justify-start" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                  <Shield className="mr-2 h-4 w-4" /> {t("nav.admin")}
                </Button>
              )}
              <Button variant="outline" onClick={() => { logout(); setMenuOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { navigate("/login"); setMenuOpen(false); }}>{t("nav.login")}</Button>
              <Button className="gold-gradient text-primary-foreground" onClick={() => { navigate("/signup"); setMenuOpen(false); }}>{t("nav.signup")}</Button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
