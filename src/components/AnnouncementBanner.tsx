import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Megaphone, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export function AnnouncementBanner() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissed-announcements") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setItems(data);
    };
    load();

    const channel = supabase
      .channel("announcements-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("dismissed-announcements", JSON.stringify(next));
  };

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (!visible.length) return null;

  return (
    <div className="mb-6 space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
        >
          <Megaphone className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">{a.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
          </div>
          <button
            onClick={() => dismiss(a.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={language === "ar" ? "إغلاق" : "Dismiss"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
