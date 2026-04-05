-- 1. Create a public bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
-- Supabase already enables RLS on storage.objects by default.

-- 3. Create policies for the 'images' bucket

-- Allow public to select/read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated admins to upload files
CREATE POLICY "Admin Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow authenticated admins to update files
CREATE POLICY "Admin Updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admin Deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
