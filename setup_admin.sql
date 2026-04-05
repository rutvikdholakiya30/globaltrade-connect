-- INSTRUCTIONS:
-- 1. First, run the updated supabase_schema.sql in your Supabase SQL Editor
-- 2. Sign up a user through your app or Supabase Auth
-- 3. Then run this to make them an admin:

-- Replace 'your-admin-email@example.com' with the actual email
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- To check all users and their roles:
SELECT id, email, role, created_at FROM users;

-- To see auth users (if you need the UUID):
SELECT id, email FROM auth.users;