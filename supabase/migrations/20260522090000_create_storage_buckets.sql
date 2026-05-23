-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow public read access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth upload for posts" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth update/delete for posts" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth upload for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth update/delete for avatars" ON storage.objects;

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'posts' bucket
CREATE POLICY "Allow public read access for posts" ON storage.objects
    FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Allow auth upload for posts" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Allow auth update/delete for posts" ON storage.objects
    FOR ALL TO anon, authenticated USING (bucket_id = 'posts');

-- Storage policies for the 'avatars' bucket
CREATE POLICY "Allow public read access for avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow auth upload for avatars" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow auth update/delete for avatars" ON storage.objects
    FOR ALL TO anon, authenticated USING (bucket_id = 'avatars');
