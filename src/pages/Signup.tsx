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

const Signup = () => {
  const { t, language } = useLanguage();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const BackIcon = language === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = language === "ar" ? ChevronLeft : ChevronRight;

  const handleNext = () => {
    if (step === 1 && (!country || !email || !phone)) {
      toast({ title: t("common.error"), description: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (step === 2) {
      if (!password || password.length < 6) {
        toast({ title: t("common.error"), description: "Password must be at least 6 characters", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t("common.error"), description: "Passwords do not match", variant: "destructive" });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      toast({ title: t("common.error"), description: "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, country, phone, pin);
      toast({ title: language === "en" ? "Account created!" : "تم إنشاء الحساب!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [t("auth.signup.step1"), t("auth.signup.step2"), t("auth.signup.step3")];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 gold-glow">
        <h1 className="mb-2 text-center text-2xl font-bold gold-text-gradient">{t("auth.signup.title")}</h1>

        {/* Step indicators */}
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
                      {language === "ar" ? c.nameAr : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("auth.login.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("auth.signup.phone")}</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 bg-secondary" />
            </div>
            <Button className="w-full gold-gradient text-primary-foreground font-semibold" onClick={handleNext}>
              {t("auth.signup.next")} <NextIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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
