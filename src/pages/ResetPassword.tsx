import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check hash for type=recovery
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: language === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: language === "ar" ? "تم" : "Success", description: language === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password updated successfully" });
    navigate("/dashboard");
  };

  if (!ready) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <p className="text-muted-foreground">{language === "ar" ? "جاري التحقق..." : "Verifying..."}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 gold-glow">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold gold-text-gradient">
          {language === "ar" ? "تعيين كلمة مرور جديدة" : "Set New Password"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{language === "ar" ? "كلمة المرور الجديدة" : "New Password"}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1 bg-secondary" />
          </div>
          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-semibold" disabled={loading}>
            {loading ? (language === "ar" ? "جاري التحديث..." : "Updating...") : (language === "ar" ? "تحديث كلمة المرور" : "Update Password")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
