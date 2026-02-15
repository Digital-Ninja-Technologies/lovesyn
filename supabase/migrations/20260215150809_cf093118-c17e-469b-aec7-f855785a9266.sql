
-- Add image_url column to messages table
ALTER TABLE public.messages ADD COLUMN image_url text;

-- Create chat-media storage bucket (private, signed URLs for access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload chat media into their couple's folder
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT couple_id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- RLS: Users can view chat media in their couple's folder
CREATE POLICY "Users can view chat media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND (storage.foldername(name))[1] IN (
    SELECT couple_id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- RLS: Users can delete their own chat media
CREATE POLICY "Users can delete chat media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT couple_id::text FROM profiles WHERE user_id = auth.uid()
  )
);
