import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.supplements": { en: "Supplements", ar: "المكملات" },
  "nav.profile": { en: "Profile", ar: "الملف الشخصي" },
  "nav.login": { en: "Login", ar: "تسجيل الدخول" },
  "nav.signup": { en: "Sign Up", ar: "إنشاء حساب" },
  "nav.logout": { en: "Logout", ar: "تسجيل الخروج" },
  "nav.admin": { en: "Admin", ar: "الإدارة" },

  // Hero
  "hero.title": { en: "Turn Content Into Paying Gym Clients", ar: "حوّل المحتوى إلى عملاء يدفعون في صالتك الرياضية" },
  "hero.subtitle": { en: "The ultimate platform for fitness professionals to create compelling content and grow their business.", ar: "المنصة الأمثل لمحترفي اللياقة البدنية لإنشاء محتوى جذاب وتنمية أعمالهم." },
  "hero.cta": { en: "Start Free", ar: "ابدأ مجاناً" },

  // Demo
  "demo.title": { en: "See PROFITFIT In Action", ar: "شاهد PROFITFIT أثناء العمل" },
  "demo.desc": { en: "Enter any content idea and get a complete marketing package in seconds.", ar: "أدخل أي فكرة محتوى واحصل على حزمة تسويقية كاملة في ثوانٍ." },
  "demo.input": { en: "Enter your content idea...", ar: "أدخل فكرة المحتوى الخاص بك..." },
  "demo.generate": { en: "Generate", ar: "توليد" },
  "demo.script": { en: "Video Script", ar: "نص الفيديو" },
  "demo.caption": { en: "Caption", ar: "التعليق" },
  "demo.cta": { en: "Call To Action", ar: "دعوة للعمل" },
  "demo.dm": { en: "DM Reply", ar: "رد الرسالة المباشرة" },

  // Pricing
  "pricing.title": { en: "Choose Your Plan", ar: "اختر خطتك" },
  "pricing.starter": { en: "Starter", ar: "المبتدئ" },
  "pricing.pro": { en: "Pro", ar: "المحترف" },
  "pricing.elite": { en: "Elite", ar: "النخبة" },
  "pricing.month": { en: "/month", ar: "/شهرياً" },
  "pricing.cta": { en: "Get Started", ar: "ابدأ الآن" },
  "pricing.feature.generates": { en: "content generates/month", ar: "توليد محتوى/شهرياً" },
  "pricing.feature.languages": { en: "Language support", ar: "دعم اللغات" },
  "pricing.feature.supplements": { en: "Supplements access", ar: "الوصول للمكملات" },
  "pricing.feature.priority": { en: "Priority support", ar: "دعم أولوي" },
  "pricing.feature.custom": { en: "Custom templates", ar: "قوالب مخصصة" },

  // Testimonials
  "testimonials.title": { en: "What Our Users Say", ar: "ماذا يقول مستخدمونا" },

  // Auth
  "auth.login.title": { en: "Welcome Back", ar: "مرحباً بعودتك" },
  "auth.login.email": { en: "Email", ar: "البريد الإلكتروني" },
  "auth.login.password": { en: "Password", ar: "كلمة المرور" },
  "auth.login.submit": { en: "Login", ar: "تسجيل الدخول" },
  "auth.login.no_account": { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  "auth.signup.title": { en: "Create Your Account", ar: "إنشاء حسابك" },
  "auth.signup.step1": { en: "Contact Info", ar: "معلومات الاتصال" },
  "auth.signup.step2": { en: "Security", ar: "الأمان" },
  "auth.signup.step3": { en: "PIN Setup", ar: "إعداد الرمز" },
  "auth.signup.country": { en: "Country", ar: "الدولة" },
  "auth.signup.phone": { en: "Phone Number", ar: "رقم الهاتف" },
  "auth.signup.password": { en: "Password", ar: "كلمة المرور" },
  "auth.signup.confirm": { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
  "auth.signup.pin": { en: "Create 4-Digit PIN", ar: "إنشاء رمز من 4 أرقام" },
  "auth.signup.pin_desc": { en: "This PIN will be used for secure actions", ar: "سيتم استخدام هذا الرمز للإجراءات الآمنة" },
  "auth.signup.next": { en: "Next", ar: "التالي" },
  "auth.signup.back": { en: "Back", ar: "رجوع" },
  "auth.signup.submit": { en: "Create Account", ar: "إنشاء الحساب" },
  "auth.signup.has_account": { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },

  // Dashboard
  "dashboard.title": { en: "Content Generator", ar: "مولّد المحتوى" },
  "dashboard.input": { en: "Enter your content idea", ar: "أدخل فكرة المحتوى الخاص بك" },
  "dashboard.generate": { en: "Generate", ar: "توليد" },
  "dashboard.results": { en: "Your Generated Content", ar: "المحتوى المُنتج" },
  "dashboard.copy": { en: "Copy", ar: "نسخ" },
  "dashboard.copied": { en: "Copied!", ar: "تم النسخ!" },

  // Supplements
  "supplements.title": { en: "Premium Supplements", ar: "المكملات المميزة" },
  "supplements.empty": { en: "No products available yet.", ar: "لا توجد منتجات متاحة بعد." },

  // Profile
  "profile.title": { en: "Your Profile", ar: "ملفك الشخصي" },
  "profile.email": { en: "Email", ar: "البريد الإلكتروني" },
  "profile.country": { en: "Country", ar: "الدولة" },
  "profile.language": { en: "Language", ar: "اللغة" },
  "profile.logout": { en: "Logout", ar: "تسجيل الخروج" },

  // Admin
  "admin.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "admin.customers": { en: "Customers", ar: "العملاء" },
  "admin.products": { en: "Products", ar: "المنتجات" },
  "admin.total_users": { en: "Total Users", ar: "إجمالي المستخدمين" },
  "admin.total_products": { en: "Total Products", ar: "إجمالي المنتجات" },
  "admin.add_product": { en: "Add Product", ar: "إضافة منتج" },
  "admin.edit": { en: "Edit", ar: "تعديل" },
  "admin.delete": { en: "Delete", ar: "حذف" },
  "admin.name": { en: "Name", ar: "الاسم" },
  "admin.price": { en: "Price", ar: "السعر" },
  "admin.description": { en: "Description", ar: "الوصف" },
  "admin.image": { en: "Image", ar: "الصورة" },
  "admin.save": { en: "Save", ar: "حفظ" },
  "admin.cancel": { en: "Cancel", ar: "إلغاء" },
  "admin.registration_date": { en: "Registration Date", ar: "تاريخ التسجيل" },

  // Common
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.error": { en: "Something went wrong", ar: "حدث خطأ ما" },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("profitfit-lang") as Language) || "en";
  });

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("profitfit-lang", language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
