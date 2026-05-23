-- 1. Create Users Table (अगर पहले से बनी है तो स्किप हो जाएगी)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'New Farmer',
    phone TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    farm_type TEXT,
    bio TEXT,
    primary_crops TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('crop', 'pest', 'tip', 'weather', 'market')),
    crop_tag TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT likes_post_user_unique UNIQUE (post_id, user_id)
);

-- 5. Seed the Demo User (Auth schema and Public schema)
-- यह आवश्यक है ताकि फॉरेन की (Foreign Key) एरर न आये
INSERT INTO auth.users (id, phone, email, raw_user_meta_data, role, aud)
VALUES (
  'd3b07384-d113-4ec5-a58e-0a0d6e6a12b4',
  '+91 99999 99999',
  'demo.farmer@example.com',
  '{"name": "Demo Farmer"}'::jsonb,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, phone, avatar_url, village, district, state, farm_type, bio, primary_crops)
VALUES (
  'd3b07384-d113-4ec5-a58e-0a0d6e6a12b4',
  'Demo Farmer',
  '+91 99999 99999',
  'https://i.pravatar.cc/150?img=11',
  'Rampur',
  'Ahmedabad',
  'Gujarat',
  'Organic',
  'Organic farming enthusiast.',
  ARRAY['Cotton', 'Wheat']
) ON CONFLICT (id) DO NOTHING;

-- 6. Disable Row Level Security (RLS) for testing
-- चूंकि हम बिना Login/Auth के टेस्ट कर रहे हैं, इसलिए RLS डिसेबल करना होगा
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;

-- 7. Enable Realtime updates for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.posts,
    public.likes, 
    public.comments;