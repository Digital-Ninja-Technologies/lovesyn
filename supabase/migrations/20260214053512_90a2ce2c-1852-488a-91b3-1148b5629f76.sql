
-- Allow authenticated users to upload couple photos to their couple's folder in avatars bucket
CREATE POLICY "Users can upload couple avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT couple_id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Allow users to update couple photos in their couple's folder
CREATE POLICY "Users can update couple avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT couple_id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);
