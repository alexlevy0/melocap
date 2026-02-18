-- Migration: 005_join_pod_rpc.sql
-- Goal: Atomic pod joining to prevent race conditions

CREATE OR REPLACE FUNCTION public.join_pod(p_user_id UUID, p_theme_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pod_id UUID;
    v_status TEXT;
    v_member_count INTEGER;
BEGIN
    -- 1. Check if already in a pod for this theme
    SELECT pm.pod_id INTO v_pod_id
    FROM pods_members pm
    JOIN pods p ON pm.pod_id = p.id
    WHERE pm.user_id = p_user_id AND p.theme_id = p_theme_id
    LIMIT 1;

    IF v_pod_id IS NOT NULL THEN
        RETURN jsonb_build_object('pod_id', v_pod_id, 'status', 'already_in');
    END IF;

    -- 2. Try to find an available pod
    -- We look for pods with space and attempt to lock the first one available
    FOR v_pod_id, v_member_count IN 
        SELECT id, member_count 
        FROM pods 
        WHERE theme_id = p_theme_id AND is_full = false
        ORDER BY created_at ASC
    LOOP
        -- Attempt to lock the pod row
        -- SKIP LOCKED avoids waiting on other concurrent join attempts
        SELECT member_count INTO v_member_count
        FROM pods
        WHERE id = v_pod_id
        FOR UPDATE SKIP LOCKED;

        -- If we successfully locked it and there's still space
        IF v_member_count IS NOT NULL AND v_member_count < 7 THEN
            INSERT INTO pods_members (pod_id, user_id)
            VALUES (v_pod_id, p_user_id);

            UPDATE pods
            SET 
                member_count = v_member_count + 1,
                is_full = (v_member_count + 1 >= 7)
            WHERE id = v_pod_id;

            RETURN jsonb_build_object('pod_id', v_pod_id, 'status', 'joined');
        END IF;
    END LOOP;

    -- 3. No available pod found (or all were full/locked), create a new one
    INSERT INTO pods (theme_id, member_count, is_full)
    VALUES (p_theme_id, 1, false)
    RETURNING id INTO v_pod_id;

    INSERT INTO pods_members (pod_id, user_id)
    VALUES (v_pod_id, p_user_id);

    RETURN jsonb_build_object('pod_id', v_pod_id, 'status', 'created');
END;
$$;
