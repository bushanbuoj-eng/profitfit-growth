import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 gold-glow">
        <h1 className="mb-6 text-center text-2xl font-bold gold-text-gradient">{t("auth.login.title")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("auth.login.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>{t("auth.login.password")}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 bg-secondary" />
          </div>
          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-semibold" disabled={loading}>
            {loading ? t("common.loading") : t("auth.login.submit")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.login.no_account")}{" "}
          <Link to="/signup" className="text-primary hover:underline">{t("nav.signup")}</Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
