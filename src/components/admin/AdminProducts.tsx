import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function AdminProducts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "", image_url: "" });
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const openAdd = () => { setEditingProduct(null); setForm({ name: "", price: "", description: "", image_url: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditingProduct(p); setForm({ name: p.name, price: String(p.price), description: p.description || "", image_url: p.image_url || "" }); setDialogOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast({ title: t("common.error"), description: error.message, variant: "destructive" }); }
    else { const { data } = supabase.storage.from("product-images").getPublicUrl(path); setForm((f) => ({ ...f, image_url: data.publicUrl })); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = { name: form.name, price: parseFloat(form.price), description: form.description, image_url: form.image_url };
    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast({ title: t("common.error"), description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: t("common.error"), description: error.message, variant: "destructive" }); return; }
    }
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: t("common.error"), description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold gold-text-gradient">{t("admin.products")}</h1>
        <Button className="gold-gradient text-primary-foreground" onClick={openAdd}>
          <Plus className="mr-1 h-4 w-4" /> {t("admin.add_product")}
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {p.image_url && (
                <div className="aspect-video overflow-hidden bg-secondary">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <p className="mt-1 text-lg font-bold gold-text-gradient">${p.price}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="mr-1 h-3 w-3" /> {t("admin.edit")}</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="mr-1 h-3 w-3" /> {t("admin.delete")}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gold-text-gradient">{editingProduct ? t("admin.edit") : t("admin.add_product")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("admin.name")}</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary" /></div>
            <div><Label>{t("admin.price")}</Label><Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1 bg-secondary" /></div>
            <div><Label>{t("admin.description")}</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 bg-secondary" /></div>
            <div><Label>{t("admin.image")}</Label><Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 bg-secondary" />{uploading && <p className="text-xs text-muted-foreground mt-1">{t("common.loading")}</p>}{form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 rounded object-cover" />}</div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.cancel")}</Button>
              <Button className="gold-gradient text-primary-foreground" onClick={handleSave}>{t("admin.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
