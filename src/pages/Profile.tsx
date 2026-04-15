import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Globe, Mail, LogOut } from "lucide-react";

const Profile = () => {
  const { t, language } = useLanguage();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold gold-text-gradient">{t("profile.title")}</h1>

      <div className="rounded-xl border border-border bg-card p-6 gold-glow space-y-6">
        <div className="flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gold-gradient">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

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

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> {t("profile.logout")}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
