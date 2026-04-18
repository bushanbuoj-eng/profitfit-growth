import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff } from "lucide-react";

export function AdminAnnouncements() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const post = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("announcements").insert({ title: title.trim(), body: body.trim(), active: true });
    setSaving(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setBody("");
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    toast({ title: language === "ar" ? "تم النشر" : "Published" });
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ active: !active }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const remove = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">
        {language === "ar" ? "الإعلانات" : "Announcements"}
      </h1>

      <div className="mb-8 space-y-3 rounded-lg border border-border bg-card p-4">
        <Input
          placeholder={language === "ar" ? "العنوان" : "Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder={language === "ar" ? "الرسالة..." : "Message..."}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
        <Button
          onClick={post}
          disabled={saving || !title.trim() || !body.trim()}
          className="gold-gradient text-primary-foreground"
        >
          {language === "ar" ? "نشر للجميع" : "Broadcast to all users"}
        </Button>
      </div>

      <div className="space-y-3">
        {items?.map((a) => (
          <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {a.title}
                {!a.active && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({language === "ar" ? "غير نشط" : "inactive"})
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggle(a.id, a.active)}>
              {a.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => remove(a.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {language === "ar" ? "لا توجد إعلانات بعد" : "No announcements yet"}
          </p>
        )}
      </div>
    </div>
  );
}
