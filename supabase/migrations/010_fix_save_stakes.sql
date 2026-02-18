-- Migration: Fix save_stakes regression (restore theme_id insertion)
-- Path: supabase/migrations/010_fix_save_stakes.sql

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
  v_theme_status theme_status;
  v_theme_id UUID;
  v_is_member BOOLEAN;
  v_total_staked INTEGER := 0;
  v_wallet_balance INTEGER;
  v_stake RECORD;
BEGIN
  -- 1. Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Verify theme status and get theme_id
  SELECT t.status, t.id INTO v_theme_status, v_theme_id
  FROM public.pods p
  JOIN public.weekly_themes t ON p.theme_id = t.id
  WHERE p.id = p_pod_id;

  IF v_theme_status IS NULL OR v_theme_status != 'open' THEN
    RAISE EXCEPTION 'Staking is only allowed while the theme is open.';
  END IF;

  -- 3. Verify Pod Membership
  SELECT EXISTS (
    SELECT 1 FROM public.pods_members
    WHERE pod_id = p_pod_id AND user_id = v_user_id
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'You are not a member of this pod.';
  END IF;

  -- 4. Calculate total amount and verify balance
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

  -- 5. Atomic Clear & Insert
  -- Delete all stakes for this user in all submissions of this pod
  DELETE FROM public.stakes
  WHERE user_id = v_user_id
  AND submission_id IN (
    SELECT id FROM public.submissions WHERE pod_id = p_pod_id
  );

  -- Insert new stakes WITH theme_id
  INSERT INTO public.stakes (user_id, submission_id, amount, theme_id)
  SELECT 
    v_user_id, 
    (s->>'submission_id')::UUID, 
    (s->>'amount')::INTEGER,
    v_theme_id
  FROM jsonb_array_elements(p_stakes) AS s
  WHERE (s->>'amount')::INTEGER > 0;

  RETURN jsonb_build_object('success', true, 'total_staked', v_total_staked);
END;
$$;
