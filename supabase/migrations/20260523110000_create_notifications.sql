-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('alert', 'comment', 'like', 'system', 'follower', 'message')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    priority INTEGER NOT NULL DEFAULT 0,
    related_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for notification query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- Disable Row Level Security (RLS) for testing, matching the setup of other tables
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Enable Realtime updates for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
