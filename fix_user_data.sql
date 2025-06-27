-- Fix User Data Script
-- This will connect your existing blogs to your Clerk user account

-- Step 1: Check current blog authors
SELECT id, title, author_id, author_name, author_email, created_at 
FROM blogs 
ORDER BY created_at DESC;

-- Step 2: Check if you have a user profile
SELECT * FROM user_profiles WHERE clerk_user_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID';

-- Step 3: Create user profile if it doesn't exist
-- Replace 'REPLACE_WITH_YOUR_CLERK_USER_ID' with your actual Clerk user ID
INSERT INTO user_profiles (
    id, 
    clerk_user_id, 
    bio, 
    joined_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'REPLACE_WITH_YOUR_CLERK_USER_ID',
    'AI Blog Platform Author',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (clerk_user_id) DO NOTHING;

-- Step 4: Update all your blogs to use your Clerk user ID
-- This connects your existing blogs to your account
UPDATE blogs 
SET author_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'
WHERE author_name = 'Abdulhamid Sonaike' 
   OR author_email = 'mobolaji2309@gmail.com'
   OR author_name ILIKE '%abdulhamid%'
   OR author_name ILIKE '%sonaike%';

-- Step 5: Verify the updates
SELECT 
    b.id, 
    b.title, 
    b.author_id, 
    b.author_name,
    up.clerk_user_id as user_profile_id
FROM blogs b
LEFT JOIN user_profiles up ON b.author_id = up.clerk_user_id
WHERE b.author_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'
ORDER BY b.created_at DESC;

-- Step 6: Update profile stats (optional - this happens automatically)
UPDATE user_profiles 
SET 
    blog_count = (
        SELECT COUNT(*) 
        FROM blogs 
        WHERE author_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'
    ),
    total_views = (
        SELECT COALESCE(SUM(view_count), 0) 
        FROM blogs 
        WHERE author_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'
    ),
    total_likes = (
        SELECT COALESCE(SUM(like_count), 0) 
        FROM blogs 
        WHERE author_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'
    ),
    updated_at = NOW()
WHERE clerk_user_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID'; 