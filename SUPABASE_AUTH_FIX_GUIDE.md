# 🔧 **SUPABASE AUTHENTICATION FIX GUIDE**

## **🚨 CRITICAL ISSUE IDENTIFIED**

**Problem:** "Database error saving new user" during signup
**Root Cause:** Supabase project configuration issues

---

## **📊 DIAGNOSIS RESULTS**

### ✅ **Working Components:**
- Database connection: ✅ PASSED
- Auth connection: ✅ PASSED  
- Profile creation logic: ✅ PASSED

### ❌ **Failing Components:**
- User signup: ❌ FAILED - "Database error saving new user"

---

## **🔧 REQUIRED FIXES**

### **1. Supabase Project Configuration**

You need to configure your Supabase project properly. Here are the exact steps:

#### **Step 1: Enable Email Authentication**
1. Go to: https://supabase.com/dashboard/project/yzbopliavpqiicvyqvun
2. Navigate to **Authentication → Settings**
3. Under **Auth Providers**, ensure **Email** is enabled
4. Under **Email Auth**, set:
   - **Enable email confirmations**: ✅ ON
   - **Enable email change confirmations**: ✅ ON
   - **Enable secure email change**: ✅ ON

#### **Step 2: Configure Site URL**
1. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add these URLs:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.vercel.app/auth/callback` (for production)

#### **Step 3: Enable Google OAuth (Optional)**
1. In **Authentication → Providers**:
   - Enable **Google** provider
   - Add your Google OAuth credentials
   - Set redirect URL: `https://yzbopliavpqiicvyqvun.supabase.co/auth/v1/callback`

### **2. Database Schema Verification**

#### **Step 1: Check Users Table**
Run this SQL in your Supabase SQL Editor:

```sql
-- Check if users table exists and has correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### **Step 2: Check RLS Policies**
```sql
-- Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';
```

#### **Step 3: Verify Auth Schema**
```sql
-- Check if auth.users table is accessible
SELECT COUNT(*) FROM auth.users;
```

### **3. RLS Policy Fixes**

If the users table exists but has RLS issues, run this SQL:

```sql
-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles" ON public.users
FOR ALL USING (auth.role() = 'service_role');
```

### **4. Database Trigger Fixes**

If the profile creation trigger is not working, run this SQL:

```sql
-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role, email_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor'),
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## **🧪 TESTING STEPS**

### **1. Test Database Connection**
```bash
node test-auth.js
```

### **2. Test in Browser**
1. Go to: http://localhost:3000/debug-auth
2. Run all tests
3. Check the logs for specific errors

### **3. Test Signup Flow**
1. Go to: http://localhost:3000/signup
2. Try to sign up with a test email
3. Check browser console for errors
4. Check Supabase logs in dashboard

---

## **🔍 DEBUGGING CHECKLIST**

### **Supabase Dashboard Checks:**
- [ ] Authentication → Settings → Email enabled
- [ ] Authentication → URL Configuration → Site URL set
- [ ] Authentication → URL Configuration → Redirect URLs configured
- [ ] Database → Tables → `users` table exists
- [ ] Database → Tables → `users` table has correct columns
- [ ] Database → Authentication → RLS policies enabled
- [ ] Database → Functions → `handle_new_user` function exists
- [ ] Database → Triggers → `on_auth_user_created` trigger exists

### **Environment Variables Check:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- [ ] `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`

---

## **🚀 EXPECTED RESULTS AFTER FIXES**

After applying these fixes, you should see:

1. **Test Script Results:**
   ```
   ✅ database: PASSED
   ✅ auth: PASSED
   ✅ signup: PASSED
   ✅ profile: PASSED
   ```

2. **Browser Signup:**
   - Form submission works on first click
   - User gets redirected to email verification
   - No console errors

3. **Browser Login:**
   - Email/password login works
   - Google OAuth works (if configured)
   - User gets redirected to appropriate dashboard

---

## **📞 NEXT STEPS**

1. **Apply the Supabase configuration fixes above**
2. **Run the database SQL commands**
3. **Test using the debug page: http://localhost:3000/debug-auth**
4. **Test the actual signup/login flows**
5. **Let me know the results so I can help with any remaining issues**

The main issue is likely in the Supabase project configuration, not in the code. Once you fix the Supabase settings, everything should work perfectly!
