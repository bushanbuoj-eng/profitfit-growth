-- 1. Profile verified badge
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;

-- 2. Payment requests: method + evidence
ALTER TABLE public.payment_requests ADD COLUMN IF NOT EXISTS method text NOT NULL DEFAULT 'manual';
ALTER TABLE public.payment_requests ADD COLUMN IF NOT EXISTS evidence_url text;

-- 3. Seed admin settings (idempotent)
INSERT INTO public.admin_settings (key, value) VALUES
  ('manual_payment_instructions', 'Send payment to the details below and upload your receipt.'),
  ('bank_details', 'Bank: Example Bank\nAccount Name: PROFITFIT\nAccount #: 0000000000\nSwift: EXAMPLEXX'),
  ('paybill_details', 'Paybill: 000000\nAccount: PROFITFIT')
ON CONFLICT (key) DO NOTHING;

-- 4. Wallet balances
CREATE TABLE IF NOT EXISTS public.wallet_balances (
  user_id uuid PRIMARY KEY,
  balance numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own balance" ON public.wallet_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all balances" ON public.wallet_balances FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage balances" ON public.wallet_balances FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own balance" ON public.wallet_balances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Wallet transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'deposit', -- deposit | debit
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  method text,
  evidence_url text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tx" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own tx" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all tx" ON public.wallet_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update tx" ON public.wallet_transactions FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- 6. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active announcements" ON public.announcements FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 7. Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid,
  body text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own conversations" ON public.chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Admins view all messages" ON public.chat_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins update messages" ON public.chat_messages FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- 8. Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  price numeric NOT NULL DEFAULT 200,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views approved active promos" ON public.promotions FOR SELECT USING (status = 'approved' AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Users view own promos" ON public.promotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create promos" ON public.promotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all promos" ON public.promotions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update promos" ON public.promotions FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- 9. Triggers for updated_at
CREATE TRIGGER trg_wallet_balances_updated BEFORE UPDATE ON public.wallet_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_wallet_tx_updated BEFORE UPDATE ON public.wallet_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_promotions_updated BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-evidence', 'payment-evidence', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('promotion-images', 'promotion-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own evidence" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own evidence" ON storage.objects FOR SELECT USING (bucket_id = 'payment-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins read all evidence" ON storage.objects FOR SELECT USING (bucket_id = 'payment-evidence' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone reads promo images" ON storage.objects FOR SELECT USING (bucket_id = 'promotion-images');
CREATE POLICY "Users upload promo images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'promotion-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 11. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;