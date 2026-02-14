-- Add read_at column to messages table
ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Allow users to update messages in their couple (for marking as read)
CREATE POLICY "Users can update messages in their couple"
ON public.messages
FOR UPDATE
USING (couple_id IN (
  SELECT couple_id FROM profiles WHERE user_id = auth.uid()
))
WITH CHECK (couple_id IN (
  SELECT couple_id FROM profiles WHERE user_id = auth.uid()
));