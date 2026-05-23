-- Drop existing policies first
DROP POLICY IF EXISTS "Allow auth upload for posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth update/delete for posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth upload for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth update/delete for avatars" ON storage.objects;

-- Create updated policies to allow both anon and authenticated users
CREATE POLICY "Allow auth upload for posts" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Allow auth update/delete for posts" ON storage.objects
    FOR ALL TO anon, authenticated USING (bucket_id = 'posts');

CREATE POLICY "Allow auth upload for avatars" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow auth update/delete for avatars" ON storage.objects
    FOR ALL TO anon, authenticated USING (bucket_id = 'avatars');
