-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '💕',
  partner_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
  couple_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create couples table for partner connections
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anniversary_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key from profiles to couples
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_couple 
FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE SET NULL;

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create memories table for shared moments
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '💕',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notes table for shared notes
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create moods table for daily mood tracking
CREATE TABLE public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's profile" ON public.profiles
  FOR SELECT USING (
    couple_id IS NOT NULL AND 
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Couples policies
CREATE POLICY "Users can view their couple" ON public.couples
  FOR SELECT USING (
    id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create couples" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their couple" ON public.couples
  FOR UPDATE USING (
    id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages in their couple" ON public.messages
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to their couple" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Memories policies
CREATE POLICY "Users can view memories in their couple" ON public.memories
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create memories in their couple" ON public.memories
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their memories" ON public.memories
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their memories" ON public.memories
  FOR DELETE USING (auth.uid() = created_by);

-- Notes policies
CREATE POLICY "Users can view notes in their couple" ON public.notes
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create notes in their couple" ON public.notes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update notes in their couple" ON public.notes
  FOR UPDATE USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their notes" ON public.notes
  FOR DELETE USING (auth.uid() = created_by);

-- Moods policies
CREATE POLICY "Users can view moods in their couple" ON public.moods
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own mood" ON public.moods
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    couple_id IN (SELECT couple_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();