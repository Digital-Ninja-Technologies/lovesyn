-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages in their couple
CREATE POLICY "Users can view reactions in their couple"
ON public.message_reactions
FOR SELECT
USING (
  message_id IN (
    SELECT m.id FROM messages m
    WHERE m.couple_id IN (
      SELECT couple_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Users can add reactions
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  message_id IN (
    SELECT m.id FROM messages m
    WHERE m.couple_id IN (
      SELECT couple_id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;