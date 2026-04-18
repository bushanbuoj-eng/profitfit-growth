import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Msg {
  id: string;
  body: string;
  sender_id: string;
  recipient_id: string | null;
  is_admin: boolean;
  created_at: string;
  read: boolean;
}

interface UserSummary {
  user_id: string;
  email: string | null;
  last: string;
  unread: number;
}

export function AdminChat() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loadUsers = async () => {
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("sender_id, recipient_id, is_admin, body, created_at, read")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!msgs) return;
    const map = new Map<string, UserSummary>();
    for (const m of msgs) {
      const uid = m.is_admin ? m.recipient_id : m.sender_id;
      if (!uid) continue;
      const existing = map.get(uid);
      if (!existing) {
        map.set(uid, { user_id: uid, email: null, last: m.body, unread: !m.is_admin && !m.read ? 1 : 0 });
      } else if (!m.is_admin && !m.read) {
        existing.unread += 1;
      }
    }
    const ids = Array.from(map.keys());
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", ids);
      profiles?.forEach((p) => {
        const e = map.get(p.id);
        if (e) e.email = p.email;
      });
    }
    setUsers(Array.from(map.values()));
  };

  const loadConversation = async (uid: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    // mark user's messages as read
    await supabase.from("chat_messages").update({ read: true }).eq("sender_id", uid).eq("read", false);
  };

  useEffect(() => {
    loadUsers();
    const channel = supabase
      .channel("admin-chat-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          loadUsers();
          const m = payload.new as Msg;
          if (selected && (m.sender_id === selected || m.recipient_id === selected)) {
            setMessages((prev) => [...prev, m]);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (selected) loadConversation(selected);
  }, [selected]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !selected || !text.trim()) return;
    const body = text.trim();
    setText("");
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      recipient_id: selected,
      body,
      is_admin: true,
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">
        {language === "ar" ? "محادثات الدعم" : "Support Chats"}
      </h1>
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-3 text-sm font-semibold text-foreground">
            {language === "ar" ? "العملاء" : "Customers"}
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {users.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                {language === "ar" ? "لا توجد محادثات" : "No conversations yet"}
              </p>
            )}
            {users.map((u) => (
              <button
                key={u.user_id}
                onClick={() => setSelected(u.user_id)}
                className={`flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm hover:bg-secondary ${
                  selected === u.user_id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-foreground">{u.email || u.user_id.slice(0, 8)}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.last}</p>
                </div>
                {u.unread > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {u.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          {!selected ? (
            <div className="flex h-[500px] items-center justify-center text-sm text-muted-foreground">
              {language === "ar" ? "اختر محادثة" : "Select a conversation"}
            </div>
          ) : (
            <>
              <div className="h-[440px] space-y-2 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.is_admin ? "gold-gradient text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.body}</p>
                      <p className="mt-1 text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <input
                  className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={language === "ar" ? "رد على العميل..." : "Reply to customer..."}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <Button onClick={send} disabled={!text.trim()} className="gold-gradient text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
