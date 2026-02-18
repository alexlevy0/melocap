-- Migration: Atomic Batch Processing for Payouts and Allocations
-- Path: supabase/migrations/008_atomic_payouts.sql

-- 1. RPC for Weekly Game Resolution Payouts
-- Takes arrays of payout objects and reputation changes, processes them atomically
CREATE OR REPLACE FUNCTION public.process_weekly_payouts(
  p_payouts JSONB, -- Array of {user_id, stake_id, submission_id, amount_staked, result, payout}
  p_reputation_changes JSONB -- Array of {user_id, delta}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout RECORD;
  v_rep_change RECORD;
  v_user_balance INTEGER;
  v_total_distributed INTEGER := 0;
  v_total_burned INTEGER := 0;
BEGIN
  -- A. Process Payouts (Stakes & Wallet Balance)
  FOR v_payout IN SELECT * FROM jsonb_to_recordset(p_payouts) AS x(
    user_id UUID,
    stake_id UUID,
    submission_id UUID,
    amount_staked INTEGER,
    result TEXT,
    payout INTEGER
  )
  LOOP
    -- 1. Update Stake Result
    UPDATE public.stakes
    SET result = v_payout.result,
        payout = v_payout.payout
    WHERE id = v_payout.stake_id;

    -- 2. Handle Winnings (Update Balance & Log Transaction)
    IF v_payout.result = 'won' THEN
        -- Safely get current balance with locking
        SELECT wallet_balance INTO v_user_balance FROM public.users WHERE id = v_payout.user_id FOR UPDATE;
        
        IF v_user_balance IS NOT NULL THEN
            -- Update wallet balance (Reputation handled in step B)
            UPDATE public.users
            SET wallet_balance = v_user_balance + v_payout.payout
            WHERE id = v_payout.user_id;

            -- Log Transaction
            INSERT INTO public.transactions (user_id, type, amount, balance_after, reference_id, description)
            VALUES (
                v_payout.user_id,
                'stake_won',
                v_payout.payout,
                v_user_balance + v_payout.payout,
                v_payout.stake_id,
                'Payout for winning prediction'
            );

            v_total_distributed := v_total_distributed + v_payout.payout;
        END IF;
    ELSE
        -- Handle Loss (Stats only)
        v_total_burned := v_total_burned + v_payout.amount_staked;
    END IF;
  END LOOP;

  -- B. Process Reputation Changes
  FOR v_rep_change IN SELECT * FROM jsonb_to_recordset(p_reputation_changes) AS y(
    user_id UUID,
    delta INTEGER
  )
  LOOP
    UPDATE public.users
    SET reputation_score = GREATEST(0, reputation_score + v_rep_change.delta)
    WHERE id = v_rep_change.user_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true, 
    'distributed', v_total_distributed, 
    'burned', v_total_burned
  );
END;
$$;


-- 2. RPC for Weekly Coin Distribution (+100 coins)
-- Distributes coins to ALL users atomically
CREATE OR REPLACE FUNCTION public.distribute_weekly_coins(
  p_amount INTEGER DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Loop through all users to update balance and log transaction (using implicit cursor)
  FOR v_user IN SELECT id, wallet_balance FROM public.users FOR UPDATE
  LOOP
    -- Update Balance
    UPDATE public.users
    SET wallet_balance = v_user.wallet_balance + p_amount
    WHERE id = v_user.id;

    -- Log Transaction
    INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
    VALUES (
      v_user.id,
      'weekly_allocation',
      p_amount,
      v_user.wallet_balance + p_amount,
      'Weekly allocation Support Drop'
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'users_processed', v_count);
END;
$$;
