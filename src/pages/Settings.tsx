import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { KeyRound, Mail, Globe, Shield } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const ar = language === "ar";

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</div>;
  if (!user) return <Navigate to="/login" replace />;

  const changePassword = async () => {
    if (pw.length < 6) {
      toast({ title: ar ? "كلمة المرور قصيرة جداً" : "Password too short", variant: "destructive" });
      return;
    }
    if (pw !== pw2) {
      toast({ title: ar ? "كلمات المرور غير متطابقة" : "Passwords don't match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      toast({ title: ar ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }
    setPw(""); setPw2("");
    toast({ title: ar ? "تم تحديث كلمة المرور" : "Password updated" });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <h1 className="mb-8 text-2xl sm:text-3xl font-bold gold-text-gradient">{ar ? "الإعدادات" : "Settings"}</h1>

      <section className="mb-6 rounded-xl border border-border bg-card p-6 gold-glow">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{ar ? "الحساب" : "Account"}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card p-6 gold-glow">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{ar ? "تغيير كلمة المرور" : "Change Password"}</h2>
        </div>
        <div className="space-y-3">
          <Input type="password" placeholder={ar ? "كلمة المرور الجديدة" : "New password"} value={pw} onChange={(e) => setPw(e.target.value)} />
          <Input type="password" placeholder={ar ? "تأكيد كلمة المرور" : "Confirm password"} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          <Button className="gold-gradient text-primary-foreground" onClick={changePassword} disabled={saving}>
            {saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "تحديث كلمة المرور" : "Update Password")}
          </Button>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card p-6 gold-glow">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{ar ? "اللغة" : "Language"}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>English</Button>
          <Button variant={language === "ar" ? "default" : "outline"} onClick={() => setLanguage("ar")}>العربية</Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 gold-glow">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{ar ? "الإشعارات" : "Notifications"}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {ar ? "تظهر الإشعارات في رمز الجرس بأعلى الصفحة عند تحديث الطلبات أو الاشتراكات." : "Notifications appear in the bell icon at the top of the page when your orders or subscriptions are updated."}
        </p>
      </section>
    </div>
  );
};

export default Settings;
