ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;