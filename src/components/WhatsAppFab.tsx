import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_NUMBER = "254707874790";

export function WhatsAppFab() {
  const { language } = useLanguage();

  const message = language === "ar"
    ? "مرحباً، أحتاج مساعدة من خدمة عملاء PROFITFIT"
    : "Hello, I need help from PROFITFIT customer care";

  const handleClick = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="WhatsApp Customer Care"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
