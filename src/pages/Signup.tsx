import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { countries } from "@/lib/countries";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { lovable } from "@/integrations/lovable";

const Signup = () => {
  const { t, language } = useLanguage();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const ar = language === "ar";
  const BackIcon = ar ? ChevronRight : ChevronLeft;
  const NextIcon = ar ? ChevronLeft : ChevronRight;

  const selectedCountry = countries.find((c) => c.code === country);

  const handleGoogle = async () => {
    if (!country || !phone) {
      toast({
        title: t("common.error"),
        description: ar ? "يرجى اختيار الدولة ورقم الهاتف أولاً" : "Please select country and phone number first",
        variant: "destructive",
      });
      return;
    }
    try {
      sessionStorage.setItem("signup_country", country);
      sessionStorage.setItem("signup_phone", phone);
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (result.error) {
        toast({ title: t("common.error"), description: (result.error as any).message ?? "OAuth error", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!country) { toast({ title: t("common.error"), description: ar ? "اختر الدولة" : "Select country", variant: "destructive" }); return; }
      if (!phone) { toast({ title: t("common.error"), description: ar ? "أدخل رقم الهاتف" : "Enter phone number", variant: "destructive" }); return; }
    }
    if (step === 2) {
      if (!email) { toast({ title: t("common.error"), description: ar ? "أدخل البريد الإلكتروني" : "Enter email", variant: "destructive" }); return; }
      if (!password || password.length < 6) {
        toast({ title: t("common.error"), description: ar ? "كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t("common.error"), description: ar ? "كلمتا المرور غير متطابقتين" : "Passwords do not match", variant: "destructive" });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      toast({ title: t("common.error"), description: ar ? "الرمز 4 أرقام" : "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, country, phone, pin);
      toast({ title: ar ? "تم إنشاء الحساب!" : "Account created!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    ar ? "الدولة والهاتف" : "Country & Phone",
    ar ? "البريد وكلمة المرور" : "Email & Password",
    ar ? "إعداد الرمز" : "PIN Setup",
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 gold-glow">
        <h1 className="mb-2 text-center text-2xl font-bold gold-text-gradient">{t("auth.signup.title")}</h1>

        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i + 1 <= step ? "gold-gradient text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 w-8 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>{t("auth.signup.country")}</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue placeholder={t("auth.signup.country")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {ar ? c.nameAr : c.name} ({c.dial})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("auth.signup.phone")}</Label>
              <div className="mt-1 flex gap-2">
                <div className="flex items-center justify-center rounded-md border border-border bg-secondary px-3 text-sm text-muted-foreground min-w-[64px]">
                  {selectedCountry?.dial || "+—"}
                </div>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={ar ? "رقم الهاتف" : "Phone number"}
                  className="bg-secondary"
                />
              </div>
            </div>

            <Button className="w-full gold-gradient text-primary-foreground font-semibold" onClick={handleNext}>
              {t("auth.signup.next")} <NextIcon className="ml-1 h-4 w-4" />
            </Button>

            <div className="relative my-2 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="mx-2 text-xs text-muted-foreground">{ar ? "أو" : "or"}</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.96h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.63-2.54C16.95 3.42 14.7 2.4 12 2.4 6.92 2.4 2.8 6.5 2.8 11.6S6.92 20.8 12 20.8c6.92 0 9.2-4.86 9.2-7.4 0-.5-.05-.88-.12-1.2H12z"/>
              </svg>
              {ar ? "متابعة عبر Google" : "Continue with Google"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>{t("auth.login.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("auth.signup.password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("auth.signup.confirm")}</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <BackIcon className="mr-1 h-4 w-4" /> {t("auth.signup.back")}
              </Button>
              <Button className="flex-1 gold-gradient text-primary-foreground font-semibold" onClick={handleNext}>
                {t("auth.signup.next")} <NextIcon className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div>
              <Label className="text-base">{t("auth.signup.pin")}</Label>
              <p className="mb-4 text-sm text-muted-foreground">{t("auth.signup.pin_desc")}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <BackIcon className="mr-1 h-4 w-4" /> {t("auth.signup.back")}
              </Button>
              <Button className="flex-1 gold-gradient text-primary-foreground font-semibold" onClick={handleSubmit} disabled={loading}>
                {loading ? t("common.loading") : t("auth.signup.submit")}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.signup.has_account")}{" "}
          <Link to="/login" className="text-primary hover:underline">{t("nav.login")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
