import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminCustomers() {
  const { t } = useLanguage();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{t("admin.customers")}</h1>
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("auth.login.email")}</TableHead>
                <TableHead>{t("auth.signup.phone")}</TableHead>
                <TableHead>{t("auth.signup.country")}</TableHead>
                <TableHead>{t("admin.registration_date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-foreground">{u.email}</TableCell>
                  <TableCell className="text-foreground">{u.phone}</TableCell>
                  <TableCell className="text-foreground">{u.country}</TableCell>
                  <TableCell className="text-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
