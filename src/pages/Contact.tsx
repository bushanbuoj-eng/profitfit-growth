import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const Contact = () => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("*")
        .in("key", ["whatsapp_number", "support_email"]);
      return Object.fromEntries((data ?? []).map((s) => [s.key, s.value])) as Record<string, string>;
    },
  });

  const wa = (settings?.whatsapp_number || "+254707874790").replace(/[^\d+]/g, "");
  const email = settings?.support_email || "support@profitfit.com";

  const items = [
    {
      icon: Mail,
      title: ar ? "البريد الإلكتروني" : "Email",
      value: email,
      action: () => (window.location.href = `mailto:${email}`),
      cta: ar ? "إرسال بريد" : "Send Email",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: wa,
      action: () => window.open(`https://wa.me/${wa.replace("+", "")}`, "_blank"),
      cta: ar ? "فتح WhatsApp" : "Open WhatsApp",
    },
    {
      icon: MessageSquare,
      title: ar ? "الرسائل داخل التطبيق" : "In-app Messaging",
      value: ar ? "تحدث مباشرة مع المسؤول" : "Chat directly with admin",
      action: () => navigate("/messages"),
      cta: ar ? "افتح الرسائل" : "Open Messages",
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <div className="mb-8 flex items-center gap-3">
        <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold gold-text-gradient">{ar ? "اتصل بنا" : "Contact Us"}</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {ar
          ? "نحن هنا للمساعدة. تواصل معنا عبر القناة المفضلة لديك."
          : "We're here to help. Reach us through your preferred channel."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <Card key={it.title} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">{it.title}</h2>
            </div>
            <p className="mb-4 break-all text-sm text-muted-foreground">{it.value}</p>
            <Button className="w-full gold-gradient text-primary-foreground" onClick={it.action}>
              {it.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Contact;
