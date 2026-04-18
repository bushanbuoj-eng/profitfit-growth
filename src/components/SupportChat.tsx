import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";

interface Msg {
  id: string;
  body: string;
  sender_id: string;
  recipient_id: string | null;
  is_admin: boolean;
  created_at: string;
}

/**
 * User-side support chat. Sends messages with recipient_id=null (broadcast to admins).
 * Loads only this user's conversation (their sent + admin replies to them).
 */
export function SupportChat() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`chat-user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const m = payload.new as Msg;
          if (m.sender_id === user.id || m.recipient_id === user.id) {
            setMessages((prev) => [...prev, m]);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !text.trim() || sending) return;
    setSending(true);
    const body = text.trim();
    setText("");
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      recipient_id: null,
      body,
      is_admin: false,
    });
    setSending(false);
  };

  if (!user) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          {language === "ar" ? "دعم العملاء" : "Customer Support"}
        </h3>
      </div>
      <div className="h-72 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {language === "ar"
              ? "ابدأ محادثة مع فريق الدعم"
              : "Start a conversation with our support team"}
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.is_admin ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.is_admin
                  ? "bg-secondary text-foreground"
                  : "gold-gradient text-primary-foreground"
              }`}
            >
              <p className="whitespace-pre-line">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">
                {new Date(m.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <input
          className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button
          onClick={send}
          disabled={!text.trim() || sending}
          className="gold-gradient text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
