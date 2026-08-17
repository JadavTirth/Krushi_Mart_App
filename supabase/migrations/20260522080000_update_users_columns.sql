-- Add missing columns to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience_years INTEGER CHECK (experience_years >= 0);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS medicines_used TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
