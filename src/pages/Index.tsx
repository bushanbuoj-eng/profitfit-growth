import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Users, Zap, Star, ChevronRight } from "lucide-react";
import { useState } from "react";
import { generateContent } from "@/lib/contentTemplates";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 max-w-4xl animate-fade-in">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            <span className="gold-text-gradient">{t("hero.title")}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("hero.subtitle")}
          </p>
          <Button
            size="lg"
            className="gold-gradient text-primary-foreground text-lg px-10 py-6 font-semibold shadow-lg hover:opacity-90 transition-opacity"
            onClick={() => navigate("/signup")}
          >
            {t("hero.cta")} <ChevronRight className="ml-1" />
          </Button>
        </div>
      </section>

      {/* Demo */}
      <DemoSection />

      {/* Pricing */}
      <PricingSection />

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
};

function DemoSection() {
  const { t, language } = useLanguage();
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ReturnType<typeof generateContent> | null>(null);

  const handleGenerate = () => {
    if (!idea.trim()) return;
    setResult(generateContent(idea, language, "instagram"));
  };

  return (
    <section className="border-t border-border px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-3xl font-bold gold-text-gradient md:text-4xl">{t("demo.title")}</h2>
        <p className="mb-10 text-center text-muted-foreground">{t("demo.desc")}</p>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("demo.input")}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button className="gold-gradient text-primary-foreground font-semibold px-8" onClick={handleGenerate}>
            <Sparkles className="mr-2 h-4 w-4" /> {t("demo.generate")}
          </Button>
        </div>

        {result && (
          <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
            {[
              { label: t("demo.script"), content: result.script },
              { label: t("demo.caption"), content: result.caption },
              { label: t("demo.cta"), content: result.cta },
              { label: t("demo.dm"), content: result.dm },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card p-5 gold-glow">
                <h3 className="mb-2 text-sm font-semibold text-primary">{item.label}</h3>
                <p className="whitespace-pre-line text-sm text-foreground/80">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PricingSection() {
  const { t, language } = useLanguage();

  const plans = [
    {
      name: t("pricing.starter"),
      price: "$19",
      features: language === "en"
        ? ["50 content generates/month", "English & Arabic", "Supplements access"]
        : ["50 توليد محتوى/شهرياً", "الإنجليزية والعربية", "الوصول للمكملات"],
    },
    {
      name: t("pricing.pro"),
      price: "$49",
      popular: true,
      features: language === "en"
        ? ["200 content generates/month", "English & Arabic", "Supplements access", "Priority support"]
        : ["200 توليد محتوى/شهرياً", "الإنجليزية والعربية", "الوصول للمكملات", "دعم أولوي"],
    },
    {
      name: t("pricing.elite"),
      price: "$99",
      features: language === "en"
        ? ["Unlimited generates", "English & Arabic", "Supplements access", "Priority support", "Custom templates"]
        : ["توليد غير محدود", "الإنجليزية والعربية", "الوصول للمكملات", "دعم أولوي", "قوالب مخصصة"],
    },
  ];

  return (
    <section className="border-t border-border px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold gold-text-gradient md:text-4xl">{t("pricing.title")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 transition-all hover:gold-glow ${
                plan.popular ? "border-primary gold-glow" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gold-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                  {language === "en" ? "MOST POPULAR" : "الأكثر شعبية"}
                </div>
              )}
              <h3 className="mb-2 text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold gold-text-gradient">{plan.price}</span>
                <span className="text-muted-foreground">{t("pricing.month")}</span>
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Star className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.popular ? "gold-gradient text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                {t("pricing.cta")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { t, language } = useLanguage();

  const testimonials = language === "en"
    ? [
        { name: "Ahmed K.", text: "PROFITFIT completely transformed how I create content. My gym gained 50 new members in just 2 months!", role: "Gym Owner, Dubai" },
        { name: "Sarah M.", text: "The content generator saves me hours every week. My social media engagement tripled!", role: "Fitness Coach, Riyadh" },
        { name: "Mike R.", text: "Best investment for my fitness business. The multilingual support is a game changer.", role: "Personal Trainer, London" },
      ]
    : [
        { name: "أحمد ك.", text: "PROFITFIT غيّرت تماماً طريقة إنشائي للمحتوى. اكتسبت صالتي 50 عضواً جديداً في شهرين فقط!", role: "مالك صالة رياضية، دبي" },
        { name: "سارة م.", text: "مولّد المحتوى يوفر لي ساعات كل أسبوع. تفاعل وسائل التواصل الاجتماعي تضاعف ثلاث مرات!", role: "مدربة لياقة، الرياض" },
        { name: "مايك ر.", text: "أفضل استثمار لعملي في اللياقة. الدعم متعدد اللغات يغير قواعد اللعبة.", role: "مدرب شخصي، لندن" },
      ];

  return (
    <section className="border-t border-border px-4 py-20">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold gold-text-gradient md:text-4xl">{t("testimonials.title")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-3 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-4 text-sm text-foreground/80">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Index;
