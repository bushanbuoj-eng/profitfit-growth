import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Tier = "free" | "pro" | "elite";

const DAILY_LIMITS: Record<Tier, number> = {
  free: 3,
  pro: 15,
  elite: Infinity,
};

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: todayCount = 0 } = useQuery({
    queryKey: ["generation-count-today", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("generation_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", todayStart.toISOString());
      return count || 0;
    },
  });

  const { data: pendingPayment } = useQuery({
    queryKey: ["pending-payment", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const tier: Tier = subscription?.tier as Tier || "free";
  const isActive = tier !== "free" && subscription?.status === "active" && 
    (!subscription.expires_at || new Date(subscription.expires_at) > new Date());
  const currentTier: Tier = isActive ? tier : "free";
  const dailyLimit = DAILY_LIMITS[currentTier];
  const remaining = Math.max(0, dailyLimit - todayCount);
  const canGenerate = remaining > 0;

  return {
    tier: currentTier,
    dailyLimit,
    todayCount,
    remaining,
    canGenerate,
    subscription,
    pendingPayment,
  };
}

export function useWhatsAppNumber() {
  return useQuery({
    queryKey: ["whatsapp-number"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      return data?.value || "+1234567890";
    },
  });
}
