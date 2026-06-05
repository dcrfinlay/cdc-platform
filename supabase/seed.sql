-- ============================================================
-- Seed: promote a user to admin or staff
-- Run in Supabase SQL editor after creating the account manually.
-- ============================================================

-- Promote by email (replace with real email)
-- select public.set_user_role(
--   (select id from auth.users where email = 'admin@university.uz'),
--   'admin'
-- );

-- Promote by UUID
-- select public.set_user_role('<user-uuid-here>', 'staff');
