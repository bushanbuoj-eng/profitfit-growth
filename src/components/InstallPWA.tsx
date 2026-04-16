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
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Don't show in iframe/preview
    try {
      if (window.self !== window.top) return;
    } catch { return; }
    if (window.location.hostname.includes("lovableproject.com") || window.location.hostname.includes("id-preview--")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem("pwa-dismissed")) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "true");
  };

  // Also show iOS instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (isStandalone || dismissed) return null;

  // For iOS, show manual instructions
  if (isIOS && !showBanner) {
    const [showIOSTip, setShowIOSTip] = useState(!localStorage.getItem("pwa-dismissed"));
    if (!showIOSTip) return null;

    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-2xl animate-fade-in">
        <button onClick={() => { setShowIOSTip(false); localStorage.setItem("pwa-dismissed", "true"); }} className="absolute top-2 right-2 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              {language === "ar" ? "تثبيت التطبيق" : "Install PROFITFIT"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar"
                ? "اضغط على أيقونة المشاركة ثم \"إضافة إلى الشاشة الرئيسية\""
                : "Tap the Share button, then \"Add to Home Screen\""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-2xl animate-fade-in">
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <Download className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">
            {language === "ar" ? "تثبيت PROFITFIT" : "Install PROFITFIT"}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "ar" ? "أضف التطبيق إلى شاشتك الرئيسية" : "Add the app to your home screen"}
          </p>
        </div>
        <Button size="sm" onClick={handleInstall} className="bg-primary text-primary-foreground">
          {language === "ar" ? "تثبيت" : "Install"}
        </Button>
      </div>
    </div>
  );
};

export default InstallPWA;
