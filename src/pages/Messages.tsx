import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { SupportChat } from "@/components/SupportChat";
import { BackButton } from "@/components/BackButton";

const Messages = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const ar = language === "ar";

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <h1 className="mb-2 text-2xl sm:text-3xl font-bold gold-text-gradient">{ar ? "الرسائل" : "Messages"}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {ar ? "تحدث مباشرة مع فريق الإدارة." : "Chat directly with the admin team."}
      </p>
      <SupportChat />
    </div>
  );
};

export default Messages;
