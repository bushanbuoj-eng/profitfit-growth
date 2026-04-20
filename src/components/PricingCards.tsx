import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useWhatsAppNumber, Tier } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Crown, Zap, Check, CreditCard, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useState } from "react";

interface PricingCardsProps {
  showAction?: boolean;
}

export function PricingCards({ showAction = true }: PricingCardsProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { tier: currentTier, pendingPayment, subscription } = useSubscription();
  const hasActivePaid = currentTier !== "free";
  const { data: whatsappNumber } = useWhatsAppNumber();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [selected, setSelected] = useState<{ tier: Tier; amount: number } | null>(null);

  const plans: {
    tier: Tier;
    name: string;
    price: string;
    priceNum: number;
    icon: typeof Star;
    features: string[];
    popular?: boolean;
  }[] = [
    {
      tier: "free",
      name: language === "ar" ? "مجاني" : "Free",
      price: "$0",
      priceNum: 0,
      icon: Zap,
      features: language === "ar"
        ? ["3 توليدات يومياً", "يتجدد يومياً", "الإنجليزية والعربية", "الوصول للمكملات"]
        : ["3 generates per day", "Resets daily", "English & Arabic", "Supplements access"],
    },
    {
      tier: "pro",
      name: language === "ar" ? "المحترف" : "Pro",
      price: "$10",
      priceNum: 10,
      icon: Crown,
      popular: true,
      features: language === "ar"
        ? ["15 توليد يومياً", "صالح لمدة 30 يوم", "الإنجليزية والعربية", "الوصول للمكملات", "دعم أولوي"]
        : ["15 generates per day", "Valid for 30 days", "English & Arabic", "Supplements access", "Priority support"],
    },
    {
      tier: "elite",
      name: language === "ar" ? "النخبة" : "Elite",
      price: "$25",
      priceNum: 25,
      icon: Star,
      features: language === "ar"
        ? ["توليد غير محدود", "صالح لمدة 30 يوم", "الإنجليزية والعربية", "الوصول للمكملات", "دعم أولوي", "قوالب مخصصة"]
        : ["Unlimited generates", "Valid for 30 days", "English & Arabic", "Supplements access", "Priority support", "Custom templates"],
    },
  ];

  const handleSubscribe = (planTier: Tier) => {
    if (!user) { navigate("/signup"); return; }
    if (planTier === "free") return;
    if (hasActivePaid && currentTier !== planTier) {
      toast({
        title: language === "ar" ? "اشتراك نشط" : "Active subscription",
        description: language === "ar"
          ? `لديك اشتراك نشط في خطة ${currentTier}. لا يمكنك الاشتراك في خطتين في نفس الوقت.`
          : `You already have an active ${currentTier} subscription. You cannot subscribe to two tiers at the same time.`,
        variant: "destructive",
      });
      return;
    }
    if (pendingPayment) {
      toast({
        title: language === "ar" ? "طلب قائم" : "Pending Request",
        description: language === "ar" ? "لديك طلب دفع قيد الانتظار بالفعل" : "You already have a pending payment request.",
      });
      return;
    }
    const amount = planTier === "pro" ? 10 : 25;
    setSelected({ tier: planTier, amount });
    setPayOpen(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentTier = currentTier === plan.tier;
        const Icon = plan.icon;
        return (
          <div
            key={plan.tier}
            className={`relative rounded-xl border p-6 transition-all hover:gold-glow ${
              plan.popular ? "border-primary gold-glow" : "border-border"
            } ${isCurrentTier ? "ring-2 ring-primary" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gold-gradient px-4 py-1 text-xs font-bold text-primary-foreground">
                {language === "ar" ? "الأكثر شعبية" : "MOST POPULAR"}
              </div>
            )}
            {isCurrentTier && (
              <div className="absolute -top-3 right-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                {language === "ar" ? "الحالي" : "CURRENT"}
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold gold-text-gradient">{plan.price}</span>
              {plan.priceNum > 0 && <span className="text-muted-foreground">/{language === "ar" ? "شهرياً" : "month"}</span>}
            </div>
            <ul className="mb-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {showAction && (
              <>
                {plan.tier === "free" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isCurrentTier}
                  >
                    {isCurrentTier ? (language === "ar" ? "خطتك الحالية" : "Current Plan") : (language === "ar" ? "مجاني" : "Free")}
                  </Button>
                ) : isCurrentTier ? (
                  <Button className="w-full gold-gradient text-primary-foreground" disabled>
                    <Check className="mr-1 h-4 w-4" /> {language === "ar" ? "مفعّل" : "Active"}
                  </Button>
                ) : pendingPayment?.tier === plan.tier ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Clock className="mr-1 h-4 w-4" /> {language === "ar" ? "قيد الانتظار" : "Pending"}
                  </Button>
                ) : hasActivePaid ? (
                  <Button className="w-full" variant="outline" disabled>
                    {language === "ar" ? "اشتراك آخر نشط" : "Another plan active"}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.popular ? "gold-gradient text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                    onClick={() => handleSubscribe(plan.tier)}
                  >
                    <CreditCard className="mr-1 h-4 w-4" />
                    {language === "ar" ? "ادفع الآن" : "Pay Now"}
                  </Button>
                )}
              </>
            )}
          </div>
        );
      })}
      {selected && (
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          amount={selected.amount}
          tier={selected.tier}
        />
      )}
    </div>
  );
}
