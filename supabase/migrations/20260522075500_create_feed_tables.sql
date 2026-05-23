-- Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('crop', 'pest', 'tip', 'weather', 'market')),
    crop_tag TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT likes_post_user_unique UNIQUE (post_id, user_id)
);

-- Seed the Demo User (Auth schema and Public schema)
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

-- Disable Row Level Security (RLS) for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;

-- Enable Realtime updates for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.posts,
    public.likes, 
    public.comments;
