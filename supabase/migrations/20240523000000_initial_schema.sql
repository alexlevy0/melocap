-- ============================================================
-- MeloCaps — Initial Schema Migration
-- Ticket S1-04
-- ============================================================

-- ---- ENUMS ----

CREATE TYPE public.theme_status AS ENUM (
  'upcoming', 'open', 'locked', 'resolving', 'finished'
);

CREATE TYPE public.transaction_type AS ENUM (
  'weekly_allocation',
  'stake_placed',
  'stake_won',
  'stake_lost',
  'bonus'
);

-- ============================================================
-- TABLE: users
-- Extension de auth.users, créée via trigger
-- ============================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  wallet_balance INTEGER NOT NULL DEFAULT 100,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  locale TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_spotify_id ON public.users(spotify_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- TABLE: weekly_themes
-- ============================================================

CREATE TABLE public.weekly_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status public.theme_status NOT NULL DEFAULT 'upcoming',
  opened_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  results_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(week_number, year)
);

ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes_select_all" ON public.weekly_themes
  FOR SELECT USING (true);

-- ============================================================
-- TABLE: pods
-- ============================================================

CREATE TABLE public.pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.weekly_themes(id),
  is_full BOOLEAN NOT NULL DEFAULT false,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pods_theme ON public.pods(theme_id);
CREATE INDEX idx_pods_available ON public.pods(theme_id, is_full) WHERE is_full = false;

ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pods_select_all" ON public.pods
  FOR SELECT USING (true);

-- ============================================================
-- TABLE: pods_members
-- ============================================================

CREATE TABLE public.pods_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES public.pods(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(pod_id, user_id)
);

CREATE INDEX idx_pods_members_pod ON public.pods_members(pod_id);
CREATE INDEX idx_pods_members_user ON public.pods_members(user_id);

ALTER TABLE public.pods_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pods_members_select" ON public.pods_members
  FOR SELECT USING (true);

CREATE POLICY "pods_members_insert_own" ON public.pods_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: submissions
-- ============================================================

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  pod_id UUID NOT NULL REFERENCES public.pods(id),
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_image_url TEXT,
  preview_url TEXT,
  spotify_uri TEXT NOT NULL,
  global_score INTEGER DEFAULT 0,
  global_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(pod_id, user_id),
  UNIQUE(pod_id, spotify_track_id)
);

CREATE INDEX idx_submissions_pod ON public.submissions(pod_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select_pod" ON public.submissions
  FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM public.pods_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "submissions_insert_own" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: stakes
-- ============================================================

CREATE TABLE public.stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  submission_id UUID NOT NULL REFERENCES public.submissions(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  result TEXT CHECK (result IN ('won', 'lost')),
  payout INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stakes_user ON public.stakes(user_id);
CREATE INDEX idx_stakes_submission ON public.stakes(submission_id);

ALTER TABLE public.stakes ENABLE ROW LEVEL SECURITY;

-- Un user voit ses propres mises + les mises des autres APRES le verrouillage
CREATE POLICY "stakes_select" ON public.stakes
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.pods p ON s.pod_id = p.id
      JOIN public.weekly_themes t ON p.theme_id = t.id
      WHERE s.id = submission_id
      AND t.status IN ('locked', 'resolving', 'finished')
    )
  );

CREATE POLICY "stakes_insert_own" ON public.stakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: transactions
-- ============================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type public.transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: messages (Sprint 4 — créée maintenant pour la cohérence)
-- ============================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID NOT NULL REFERENCES public.pods(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_pod ON public.messages(pod_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_pod" ON public.messages
  FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM public.pods_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Création automatique du profil utilisateur
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, spotify_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'provider_id', NEW.id::text),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Melomaniac'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
