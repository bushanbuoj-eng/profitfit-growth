import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";

export function Footer() {
  const { language } = useLanguage();
  const ar = language === "ar";

  return (
    <footer className="mt-16 border-t border-border bg-card/50">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-bold gold-text-gradient">PROFITFIT</h3>
          <p className="text-sm text-muted-foreground">
            {ar ? "منصة المحتوى الفاخرة لمحترفي اللياقة" : "The luxury content platform for fitness pros."}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{ar ? "روابط" : "Links"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-muted-foreground hover:text-primary">{ar ? "الرئيسية" : "Home"}</Link></li>
            <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">{ar ? "لوحة التحكم" : "Dashboard"}</Link></li>
            <li><Link to="/supplements" className="text-muted-foreground hover:text-primary">{ar ? "المكملات" : "Supplements"}</Link></li>
            <li><Link to="/promotions" className="text-muted-foreground hover:text-primary">{ar ? "العروض" : "Promotions"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{ar ? "الحساب" : "Account"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-muted-foreground hover:text-primary">{ar ? "تسجيل الدخول" : "Login"}</Link></li>
            <li><Link to="/signup" className="text-muted-foreground hover:text-primary">{ar ? "إنشاء حساب" : "Sign Up"}</Link></li>
            <li><Link to="/profile" className="text-muted-foreground hover:text-primary">{ar ? "الملف الشخصي" : "Profile"}</Link></li>
            <li><Link to="/wallet" className="text-muted-foreground hover:text-primary">{ar ? "المحفظة" : "Wallet"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">{ar ? "تواصل" : "Contact"}</h4>
          <a href="mailto:info@profitfit.com" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Mail className="h-4 w-4" /> info@profitfit.com
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PROFITFIT. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </div>
    </footer>
  );
}
