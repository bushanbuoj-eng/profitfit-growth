import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Globe, Mail, LogOut, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";

const Profile = () => {
  const { t, language } = useLanguage();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <h1 className="mb-8 text-2xl sm:text-3xl font-bold gold-text-gradient">{t("profile.title")}</h1>

      <div className="rounded-xl border border-border bg-card p-6 gold-glow space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full gold-gradient">
            <User className="h-10 w-10 text-primary-foreground" />
            {profile?.verified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-7 w-7 fill-primary text-primary-foreground" />
            )}
          </div>
        </div>
        {profile?.verified && (
          <p className="text-center text-xs font-semibold text-primary">
            {language === "ar" ? "✓ حساب موثّق" : "✓ Verified Account"}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("profile.country")}</p>
              <p className="text-sm font-medium text-foreground">{profile?.country || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary p-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("profile.language")}</p>
              <p className="text-sm font-medium text-foreground">{language === "en" ? "English" : "العربية"}</p>
            </div>
          </div>
        </div>

        <Link to="/forgot-password" className="block text-center text-sm text-primary hover:underline">
          {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
        </Link>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> {t("profile.logout")}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
