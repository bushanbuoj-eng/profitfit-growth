import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";

const Supplements = () => {
  const { t } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold gold-text-gradient">{t("supplements.title")}</h1>

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t("common.loading")}</p>
      ) : !products?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShoppingBag className="mb-4 h-12 w-12" />
          <p>{t("supplements.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:gold-glow">
              {p.image_url && (
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="mb-1 text-lg font-semibold text-foreground">{p.name}</h3>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <p className="text-xl font-bold gold-text-gradient">${p.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Supplements;
