
-- Create date_ideas table for user-submitted date ideas and fantasies
CREATE TABLE public.date_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Custom',
  emoji TEXT NOT NULL DEFAULT '💡',
  duration TEXT,
  is_fantasy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.date_ideas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view date ideas in their couple"
ON public.date_ideas FOR SELECT
USING (couple_id IN (SELECT profiles.couple_id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can create date ideas in their couple"
ON public.date_ideas FOR INSERT
WITH CHECK (auth.uid() = created_by AND couple_id IN (SELECT profiles.couple_id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can delete their own date ideas"
ON public.date_ideas FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own date ideas"
ON public.date_ideas FOR UPDATE
USING (auth.uid() = created_by);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.date_ideas;
