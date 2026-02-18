# 🗄️ MeloCaps — Schéma Base de Données

## Vue d'ensemble

Toutes les tables sont dans le schema `public` de Supabase (PostgreSQL).
**RLS activé sur TOUTES les tables.**

---

## Diagramme Relationnel

```
users
  ├── 1:N → pods_members → N:1 → pods
  ├── 1:N → submissions
  ├── 1:N → stakes
  ├── 1:N → transactions
  └── 1:N → messages

weekly_themes
  └── 1:N → pods

pods
  ├── N:1 → weekly_themes
  ├── 1:N → pods_members
  ├── 1:N → submissions
  └── 1:N → messages

submissions
  ├── N:1 → users
  ├── N:1 → pods
  └── 1:N → stakes

stakes
  ├── N:1 → users
  └── N:1 → submissions (target)

transactions
  └── N:1 → users
```

---

## Tables

### `users`

Extension de `auth.users` de Supabase. Créée automatiquement via un trigger `on_auth_user_created`.

```sql
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

-- Index
CREATE INDEX idx_users_spotify_id ON public.users(spotify_id);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Chacun peut lire tous les profils (leaderboard, pods)
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);

-- Chacun ne peut modifier que son propre profil
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
```

**Notes** :
- `wallet_balance` : solde actuel de MeloCoins. Toujours >= 0.
- `reputation_score` : score cumulatif de prédictions réussies (ne descend jamais en dessous de 0).

---

### `weekly_themes`

Un thème par semaine. Géré par l'admin.

```sql
CREATE TYPE theme_status AS ENUM ('upcoming', 'open', 'locked', 'resolving', 'finished');

CREATE TABLE public.weekly_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status theme_status NOT NULL DEFAULT 'upcoming',
  opened_at TIMESTAMPTZ,        -- Vendredi 19h
  locked_at TIMESTAMPTZ,        -- Dimanche 12h
  resolved_at TIMESTAMPTZ,      -- Dimanche 19h
  results_json JSONB,           -- Résultats finaux (Top 50)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(week_number, year)
);

-- RLS
ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes_select_all" ON public.weekly_themes FOR SELECT USING (true);
-- INSERT/UPDATE réservé au service_role (Edge Functions / Admin)
```

**Cycle de statut** : `upcoming` → `open` (vendredi 19h) → `locked` (dimanche 12h) → `resolving` → `finished` (dimanche 19h)

---

### `pods`

Groupes de 7 joueurs.

```sql
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
CREATE POLICY "pods_select_all" ON public.pods FOR SELECT USING (true);
```

---

### `pods_members`

Table de jointure users ↔ pods.

```sql
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
CREATE POLICY "pods_members_select" ON public.pods_members FOR SELECT USING (true);
```

**Contrainte métier** (vérifiée côté applicatif) : un user ne peut être membre que d'un seul Pod par thème.

---

### `submissions`

Un titre soumis par un joueur dans un Pod.

```sql
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  pod_id UUID NOT NULL REFERENCES public.pods(id),
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_image_url TEXT,
  preview_url TEXT,               -- URL de preview 30s (si dispo)
  spotify_uri TEXT NOT NULL,       -- Pour le deep link
  global_score INTEGER DEFAULT 0,  -- Rempli à la résolution
  global_rank INTEGER,             -- Rempli à la résolution
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(pod_id, user_id),                    -- 1 titre par user par pod
  UNIQUE(pod_id, spotify_track_id)            -- 1 titre unique par pod
);

CREATE INDEX idx_submissions_pod ON public.submissions(pod_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les soumissions de son pod
CREATE POLICY "submissions_select_pod" ON public.submissions 
  FOR SELECT USING (
    pod_id IN (SELECT pod_id FROM public.pods_members WHERE user_id = auth.uid())
  );

-- Un user ne peut créer que sa propre soumission
CREATE POLICY "submissions_insert_own" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### `stakes`

Les mises de MeloCoins sur les soumissions.

```sql
CREATE TABLE public.stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  submission_id UUID NOT NULL REFERENCES public.submissions(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  result TEXT,                     -- 'won' | 'lost' | null (en attente)
  payout INTEGER DEFAULT 0,       -- Montant gagné (0 si perdu)
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
```

**Important** : Les mises des autres joueurs sont **invisibles** tant que le thème n'est pas `locked`. Cela empêche le "copy-staking".

---

### `transactions`

Journal immuable de tous les mouvements de MeloCoins.

```sql
CREATE TYPE transaction_type AS ENUM (
  'weekly_allocation',   -- +100 coins du vendredi
  'stake_placed',        -- Mise posée (débit)
  'stake_won',           -- Gain (crédit)
  'stake_lost',          -- Perte (coins brûlés, montant négatif pour traçabilité)
  'bonus'                -- Bonus admin/événement
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,          -- Positif = crédit, Négatif = débit
  balance_after INTEGER NOT NULL,   -- Solde après la transaction
  reference_id UUID,                -- ID du stake ou du thème concerné
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
```

---

### `messages` (Sprint 4)

Chat en temps réel dans les Pods.

```sql
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
    pod_id IN (SELECT pod_id FROM public.pods_members WHERE user_id = auth.uid())
  );
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Trigger : Création automatique de l'utilisateur

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, spotify_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Melomaniac'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Notes Supabase

- **Realtime** : Activer sur `messages`, `pods_members` (pour voir les joueurs rejoindre en live).
- **Edge Functions** : Utilisées pour les CRON jobs (voir `PHASES.md`).
- **Service Role** : Les Edge Functions utilisent le `service_role` key pour bypasser RLS lors de la résolution.