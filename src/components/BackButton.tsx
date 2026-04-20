import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label, className = "" }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const ar = language === "ar";

  const handleBack = () => {
    if (to) return navigate(to);
    // If user came from another in-app route, go back; otherwise home
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`gap-1 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />
      {label ?? (ar ? "رجوع" : "Back")}
    </Button>
  );
}
