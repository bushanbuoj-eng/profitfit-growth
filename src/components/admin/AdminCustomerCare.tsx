import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useWhatsAppNumber } from "@/hooks/useSubscription";

export function AdminCustomerCare() {
  const { language } = useLanguage();
  const { data: whatsappNumber } = useWhatsAppNumber();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-customer-care"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const sendWhatsApp = (phone: string, email: string) => {
    const cleanPhone = phone?.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    if (!cleanPhone) return;
    const message = language === "ar"
      ? `مرحباً، نتواصل معك من PROFITFIT بخصوص حسابك (${email}). كيف يمكننا مساعدتك؟`
      : `Hello, we're reaching out from PROFITFIT regarding your account (${email}). How can we help you?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">
        {language === "ar" ? "خدمة العملاء" : "Customer Care"}
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {language === "ar"
          ? "تواصل مع العملاء مباشرة عبر واتساب"
          : "Reach out to customers directly via WhatsApp"}
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "البريد الإلكتروني" : "Email"}</TableHead>
                <TableHead>{language === "ar" ? "رقم الهاتف" : "Phone"}</TableHead>
                <TableHead>{language === "ar" ? "الدولة" : "Country"}</TableHead>
                <TableHead>{language === "ar" ? "تاريخ التسجيل" : "Joined"}</TableHead>
                <TableHead>{language === "ar" ? "إجراء" : "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-foreground">{u.email}</TableCell>
                  <TableCell className="text-foreground">{u.phone || "—"}</TableCell>
                  <TableCell className="text-foreground">{u.country || "—"}</TableCell>
                  <TableCell className="text-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {u.phone ? (
                      <Button
                        size="sm"
                        className="gold-gradient text-primary-foreground"
                        onClick={() => sendWhatsApp(u.phone!, u.email || "")}
                      >
                        <MessageCircle className="mr-1 h-3 w-3" />
                        {language === "ar" ? "واتساب" : "WhatsApp"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{language === "ar" ? "لا يوجد رقم" : "No phone"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
