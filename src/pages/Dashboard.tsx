import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { generateContent, getAllPlatforms, getPlatformLabel, Platform } from "@/lib/contentTemplates";
import { Sparkles, Copy, Check } from "lucide-react";
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
  const { toast } = useToast();
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [result, setResult] = useState<ReturnType<typeof generateContent> | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!idea.trim()) return;
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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold gold-text-gradient">{t("dashboard.title")}</h1>

      {/* Platform selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-foreground">
          {t("dashboard.platform")}
        </label>
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
        <Button className="gold-gradient text-primary-foreground font-semibold px-8" onClick={handleGenerate}>
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
                  <button
                    onClick={() => handleCopy(s.content, s.key)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copiedField === s.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="whitespace-pre-line text-sm text-foreground/80">{s.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
