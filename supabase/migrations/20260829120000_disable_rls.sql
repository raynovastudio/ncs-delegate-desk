-- Disable RLS on all tables so the app works without authentication
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins DISABLE ROW LEVEL SECURITY;

-- Grant full access to anonymous users
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.participants TO anon;
GRANT ALL ON public.check_ins TO anon;

GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.participants TO authenticated;
GRANT ALL ON public.check_ins TO authenticated;
