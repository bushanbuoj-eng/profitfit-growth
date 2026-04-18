import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useWhatsAppNumber } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { generateContent, getAllPlatforms, getPlatformLabel, Platform } from "@/lib/contentTemplates";
import { PricingCards } from "@/components/PricingCards";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SupportChat } from "@/components/SupportChat";
import { Sparkles, Copy, Check, Crown, Zap, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platformIcons: Record<Platform, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "🎬",
  facebook: "📘",
  twitter: "🐦",
};

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tier, dailyLimit, remaining, canGenerate } = useSubscription();
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [result, setResult] = useState<ReturnType<typeof generateContent> | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    if (!canGenerate) {
      setShowPricing(true);
      return;
    }

    // Log the generation
    if (user) {
      await supabase.from("generation_logs").insert({
        user_id: user.id,
        platform,
        idea: idea.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["generation-count-today"] });
    }

    setResult(generateContent(idea, language, platform));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: t("dashboard.copied") });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sections = result
    ? [
        { key: "script", label: t("demo.script"), content: result.script },
        { key: "caption", label: t("demo.caption"), content: result.caption },
        { key: "cta", label: t("demo.cta"), content: result.cta },
        { key: "dm", label: t("demo.dm"), content: result.dm },
      ]
    : [];

  const tierLabel = tier === "elite" ? (language === "ar" ? "النخبة" : "Elite") : tier === "pro" ? (language === "ar" ? "المحترف" : "Pro") : (language === "ar" ? "مجاني" : "Free");
  const TierIcon = tier === "free" ? Zap : Crown;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <AnnouncementBanner />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold gold-text-gradient">{t("dashboard.title")}</h1>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            tier === "elite" ? "bg-primary/20 text-primary" : tier === "pro" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
          }`}>
            <TierIcon className="h-4 w-4" />
            {tierLabel}
          </div>
          <div className="text-sm text-muted-foreground">
            {tier === "elite"
              ? (language === "ar" ? "غير محدود" : "Unlimited")
              : `${remaining}/${dailyLimit} ${language === "ar" ? "متبقي اليوم" : "remaining today"}`}
          </div>
        </div>
      </div>

      {/* Low usage warning */}
      {!canGenerate && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {language === "ar" ? "لقد وصلت إلى الحد اليومي" : "You've reached your daily limit"}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "قم بالترقية لمزيد من التوليدات" : "Upgrade your plan for more generates"}
            </p>
          </div>
          <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => setShowPricing(true)}>
            {language === "ar" ? "ترقية" : "Upgrade"}
          </Button>
        </div>
      )}

      {/* Platform selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-foreground">{t("dashboard.platform")}</label>
        <div className="flex flex-wrap gap-2">
          {getAllPlatforms().map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                platform === p
                  ? "border-primary bg-primary/10 text-primary gold-glow"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {platformIcons[p]} {getPlatformLabel(p, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Input + generate */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t("dashboard.input")}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button
          className="gold-gradient text-primary-foreground font-semibold px-8"
          onClick={handleGenerate}
          disabled={!canGenerate && !idea.trim()}
        >
          <Sparkles className="mr-2 h-4 w-4" /> {t("dashboard.generate")}
        </Button>
      </div>

      {result && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {t("dashboard.results")} — {platformIcons[platform]} {getPlatformLabel(platform, language)}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <div key={s.key} className="rounded-lg border border-border bg-card p-5 gold-glow relative group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-primary">{s.label}</h3>
                  <button onClick={() => handleCopy(s.content, s.key)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copiedField === s.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="whitespace-pre-line text-sm text-foreground/80">{s.content}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pricing Section */}
      {showPricing && (
        <div className="mt-10">
          <h2 className="mb-6 text-2xl font-bold text-center gold-text-gradient">
            {language === "ar" ? "اختر خطتك" : "Choose Your Plan"}
          </h2>
          <PricingCards />
        </div>
      )}

      {/* Always show upgrade button for free users */}
      {tier === "free" && !showPricing && (
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => setShowPricing(true)}>
            <Crown className="mr-2 h-4 w-4" /> {language === "ar" ? "عرض الخطط" : "View Plans"}
          </Button>
        </div>
      )}

      <div className="mt-10">
        <SupportChat />
      </div>
    </div>
  );
};

export default Dashboard;
