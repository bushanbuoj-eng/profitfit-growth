import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type Tab = "dashboard" | "customers" | "products";

const Admin = () => {
  const { t } = useLanguage();
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs = [
    { key: "dashboard" as Tab, icon: LayoutDashboard, label: t("admin.dashboard") },
    { key: "customers" as Tab, icon: Users, label: t("admin.customers") },
    { key: "products" as Tab, icon: Package, label: t("admin.products") },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-16 border-r border-border bg-card md:w-56">
        <nav className="flex flex-col gap-1 p-2">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                tab === tb.key ? "gold-gradient text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tb.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">{tb.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "products" && <AdminProducts />}
      </main>
    </div>
  );
};

function AdminDashboard() {
  const { t } = useLanguage();

  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold gold-text-gradient">{t("admin.dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 gold-glow">
          <p className="text-sm text-muted-foreground">{t("admin.total_users")}</p>
          <p className="text-4xl font-bold gold-text-gradient">{userCount ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 gold-glow">
          <p className="text-sm text-muted-foreground">{t("admin.total_products")}</p>
          <p className="text-4xl font-bold gold-text-gradient">{productCount ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

function AdminCustomers() {
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

function AdminProducts() {
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

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", price: "", description: "", image_url: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setForm({ name: p.name, price: String(p.price), description: p.description || "", image_url: p.image_url || "" });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
    }
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
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="mr-1 h-3 w-3" /> {t("admin.edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="mr-1 h-3 w-3" /> {t("admin.delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gold-text-gradient">
              {editingProduct ? t("admin.edit") : t("admin.add_product")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.name")}</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("admin.price")}</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("admin.description")}</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>{t("admin.image")}</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 bg-secondary" />
              {uploading && <p className="text-xs text-muted-foreground mt-1">{t("common.loading")}</p>}
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 rounded object-cover" />}
            </div>
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

export default Admin;
