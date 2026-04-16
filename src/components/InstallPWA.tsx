import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const { language } = useLanguage();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    try { if (window.self !== window.top) return; } catch { return; }
    if (window.location.hostname.includes("lovableproject.com") || window.location.hostname.includes("id-preview--")) return;

    if (isIOS && !localStorage.getItem("pwa-dismissed")) {
      setShowIOSTip(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem("pwa-dismissed")) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    setShowIOSTip(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (isStandalone) return null;

  const banner = showIOSTip || showBanner;
  if (!banner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-2xl animate-fade-in">
      <button onClick={dismiss} className="absolute top-2 right-2 text-muted-foreground">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <Download className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">
            {language === "ar" ? "تثبيت PROFITFIT" : "Install PROFITFIT"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {showIOSTip
              ? (language === "ar"
                ? "اضغط على أيقونة المشاركة ثم \"إضافة إلى الشاشة الرئيسية\""
                : "Tap the Share button, then \"Add to Home Screen\"")
              : (language === "ar" ? "أضف التطبيق إلى شاشتك الرئيسية" : "Add the app to your home screen")}
          </p>
        </div>
        {showBanner && deferredPrompt && (
          <Button size="sm" onClick={handleInstall} className="bg-primary text-primary-foreground">
            {language === "ar" ? "تثبيت" : "Install"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
