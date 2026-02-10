-- Create storage bucket for memory photos
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true);

-- Allow authenticated users to upload to the memories bucket within their couple folder
CREATE POLICY "Authenticated users can upload memory photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories' 
    AND auth.uid() IS NOT NULL
  );

-- Allow anyone to view memory photos (public bucket)
CREATE POLICY "Memory photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own memory photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories' 
    AND auth.uid() IS NOT NULL
  );

-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);