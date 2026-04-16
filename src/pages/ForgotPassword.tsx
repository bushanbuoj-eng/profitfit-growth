import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({
      title: language === "ar" ? "تم الإرسال" : "Email Sent",
      description: language === "ar" ? "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور" : "Check your email for a password reset link.",
    });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 gold-glow">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold gold-text-gradient">
          {language === "ar" ? "نسيت كلمة المرور" : "Forgot Password"}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "ar"
            ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
            : "Enter your email and we'll send you a reset link"}
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-foreground">
              {language === "ar" ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني" : "A reset link has been sent to your email."}
            </p>
            <Link to="/login" className="text-primary hover:underline text-sm">
              {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <Button type="submit" className="w-full gold-gradient text-primary-foreground font-semibold" disabled={loading}>
              {loading ? (language === "ar" ? "جاري الإرسال..." : "Sending...") : (language === "ar" ? "إرسال رابط التعيين" : "Send Reset Link")}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
