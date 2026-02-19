-- Allow users to update their own submissions
-- This was missing in the initial schema, causing RLS violations on update/upsert.

CREATE POLICY "submissions_update_own" ON public.submissions
  FOR UPDATE USING (auth.uid() = user_id);
