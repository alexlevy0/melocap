-- Migration: Dénormalisation de theme_id dans la table stakes
-- Path: supabase/migrations/007_denormalize_stakes_theme.sql

-- 1. Ajouter la colonne theme_id
ALTER TABLE public.stakes ADD COLUMN theme_id UUID REFERENCES public.weekly_themes(id);

-- 2. Index pour la performance des requêtes de résultats
CREATE INDEX idx_stakes_theme_id ON public.stakes(theme_id);

-- 3. Peupler les données existantes
UPDATE public.stakes s
SET theme_id = t.id
FROM public.submissions sub
JOIN public.pods p ON sub.pod_id = p.id
JOIN public.weekly_themes t ON p.theme_id = t.id
WHERE s.submission_id = sub.id;

-- 4. Mettre à jour la RPC save_stakes pour inclure theme_id
CREATE OR REPLACE FUNCTION public.save_stakes(
  p_pod_id UUID,
  p_stakes JSONB -- Array of {submission_id, amount}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_theme_id UUID;
  v_theme_status theme_status;
  v_total_staked INTEGER := 0;
  v_wallet_balance INTEGER;
  v_stake RECORD;
BEGIN
  -- 1. Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Verify theme status and get theme_id
  SELECT t.id, t.status INTO v_theme_id, v_theme_status
  FROM public.pods p
  JOIN public.weekly_themes t ON p.theme_id = t.id
  WHERE p.id = p_pod_id;

  IF v_theme_status IS NULL OR v_theme_status != 'open' THEN
    RAISE EXCEPTION 'Staking is only allowed while the theme is open.';
  END IF;

  -- 3. Calculate total amount and verify balance
  FOR v_stake IN SELECT (x->>'amount')::INTEGER AS amount FROM jsonb_array_elements(p_stakes) AS x
  LOOP
    v_total_staked := v_total_staked + v_stake.amount;
  END LOOP;

  SELECT wallet_balance INTO v_wallet_balance
  FROM public.users
  WHERE id = v_user_id;

  IF v_wallet_balance < v_total_staked THEN
    RAISE EXCEPTION 'Insufficient balance: you have %, but tried to stake %', v_wallet_balance, v_total_staked;
  END IF;

  -- 4. Atomic Clear & Insert
  -- Delete all stakes for this user in all submissions of this pod
  DELETE FROM public.stakes
  WHERE user_id = v_user_id
  AND submission_id IN (
    SELECT id FROM public.submissions WHERE pod_id = p_pod_id
  );

  -- Insert new stakes with theme_id
  INSERT INTO public.stakes (user_id, submission_id, amount, theme_id)
  SELECT v_user_id, (s->>'submission_id')::UUID, (s->>'amount')::INTEGER, v_theme_id
  FROM jsonb_array_elements(p_stakes) AS s
  WHERE (s->>'amount')::INTEGER > 0;

  RETURN jsonb_build_object('success', true, 'total_staked', v_total_staked);
END;
$$;
