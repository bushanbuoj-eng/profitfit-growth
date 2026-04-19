import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { History as HistoryIcon, Sparkles } from "lucide-react";

const platformIcons: Record<string, string> = {
  instagram: "📸", tiktok: "🎵", youtube: "🎬", facebook: "📘", twitter: "🐦",
};

const History = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const ar = language === "ar";

  const { data: logs } = useQuery({
    queryKey: ["my-history", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("generation_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <HistoryIcon className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold gold-text-gradient">{ar ? "سجل التوليد" : "Generation History"}</h1>
      </div>

      {logs?.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{ar ? "لم تقم بتوليد أي محتوى بعد" : "You haven't generated any content yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs?.map((l: any) => (
            <div key={l.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{platformIcons[l.platform] || "✨"}</span>
                  <span className="capitalize">{l.platform}</span>
                  <span>•</span>
                  <span>{new Date(l.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground break-words">{l.idea}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
