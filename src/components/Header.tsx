import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

          <nav className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>{t("nav.dashboard")}</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/supplements")}>{t("nav.supplements")}</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/wallet")}><Wallet className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>{t("nav.profile")}</Button>
                {isAdmin && <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>{t("nav.admin")}</Button>}
                <Button variant="outline" size="sm" onClick={logout}>{t("nav.logout")}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>{t("nav.login")}</Button>
                <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => navigate("/signup")}>{t("nav.signup")}</Button>
              </>
            )}
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-2 border-t border-border bg-background p-4 md:hidden">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>{t("nav.dashboard")}</Button>
              <Button variant="ghost" onClick={() => { navigate("/supplements"); setMenuOpen(false); }}>{t("nav.supplements")}</Button>
              <Button variant="ghost" onClick={() => { navigate("/wallet"); setMenuOpen(false); }}>{language === "ar" ? "المحفظة" : "Wallet"}</Button>
              <Button variant="ghost" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>{t("nav.profile")}</Button>
              {isAdmin && <Button variant="ghost" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>{t("nav.admin")}</Button>}
              <Button variant="outline" onClick={() => { logout(); setMenuOpen(false); }}>{t("nav.logout")}</Button>
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
