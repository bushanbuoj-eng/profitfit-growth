import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsapp, setWhatsapp] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const wp = settings.find((s) => s.key === "whatsapp_number");
      if (wp) setWhatsapp(wp.value);
    }
  }, [settings]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("admin_settings")
      .update({ value: whatsapp })
      .eq("key", "whatsapp_number");

    if (error) {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    queryClient.invalidateQueries({ queryKey: ["whatsapp-number"] });
    toast({ title: language === "ar" ? "تم الحفظ" : "Saved", description: language === "ar" ? "تم تحديث الإعدادات بنجاح" : "Settings updated successfully" });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">
        {language === "ar" ? "الإعدادات" : "Settings"}
      </h1>

      <div className="max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {language === "ar" ? "رقم واتساب" : "WhatsApp Number"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "ar"
              ? "رقم واتساب الذي سيتواصل معه العملاء للدفع والدعم"
              : "WhatsApp number customers will contact for payment and support"}
          </p>
          <div className="space-y-3">
            <Label>{language === "ar" ? "رقم الهاتف (مع رمز الدولة)" : "Phone Number (with country code)"}</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+1234567890"
              className="bg-secondary"
              dir="ltr"
            />
            <Button className="gold-gradient text-primary-foreground" onClick={handleSave}>
              <Save className="mr-1 h-4 w-4" /> {language === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
