import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDialog } from "@/components/OrderDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

const Supplements = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ar = language === "ar";
  const [selected, setSelected] = useState<{ id: string; name: string; price: number } | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleOrder = (p: any) => {
    if (!user) {
      toast.error(ar ? "سجّل دخولك أولاً" : "Please log in first");
      navigate("/login");
      return;
    }
    setSelected({ id: p.id, name: p.name, price: Number(p.price) });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <BackButton className="mb-3 -ml-2" />
      <h1 className="mb-8 text-2xl sm:text-3xl font-bold gold-text-gradient">{t("supplements.title")}</h1>

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
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold gold-text-gradient">${p.price}</p>
                  <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => handleOrder(p)}>
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    {ar ? "اطلب" : "Order"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} product={selected} />
    </div>
  );
};

export default Supplements;
