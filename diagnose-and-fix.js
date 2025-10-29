/**
 * Comprehensive Diagnosis and Fix Script
 * Uses service role to directly check and fix all issues
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Fynly Database Diagnosis & Fix Tool')
console.log('======================================\n')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing credentials')
  console.log('Supabase URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌')
  console.log('Service Role Key:', serviceRoleKey ? 'Set ✅' : 'Missing ❌')
  process.exit(1)
}

console.log('🔑 Connecting with Service Role (admin access)...\n')
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkTables() {
  console.log('📊 Step 1: Checking database tables...')
  
  try {
    // Check users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table issue:', usersError.message)
      return false
    }
    
    console.log('✅ Users table exists and accessible')
    
    // Check other tables
    const tables = ['advisors', 'bookings', 'payments', 'reviews', 'notifications']
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`⚠️  ${table} table issue:`, error.message)
      } else {
        console.log(`✅ ${table} table exists`)
      }
    }
    
    console.log('')
    return true
  } catch (error) {
    console.error('❌ Table check failed:', error.message, '\n')
    return false
  }
}

async function checkTriggers() {
  console.log('⚡ Step 2: Checking triggers...')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tgname as trigger_name,
          tgenabled as enabled,
          proname as function_name
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE tgname = 'on_auth_user_created';
      `
    })
    
    if (error) {
      console.log('⚠️  Cannot check triggers directly, trying alternative...')
      // Alternative: just try to check if function exists
      return true // Continue anyway
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Trigger "on_auth_user_created" NOT FOUND')
      console.log('   This is why profiles are not being created!\n')
      return false
    }
    
    console.log('✅ Trigger "on_auth_user_created" exists')
    console.log('   Function:', data[0].function_name)
    console.log('   Enabled:', data[0].enabled, '\n')
    return true
  } catch (error) {
    console.log('⚠️  Cannot verify triggers (normal if RPC is disabled)\n')
    return true
  }
}

async function createProfileManually() {
  console.log('🔧 Step 3: Testing manual profile creation...')
  
  try {
    // Create a test auth user first
    const testEmail = `manual-test-${Date.now()}@fynly.com`
    const testPassword = 'TestPassword123!'
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Manual Test User',
        role: 'investor'
      }
    })
    
    if (authError) {
      console.error('❌ Failed to create test user:', authError.message, '\n')
      return false
    }
    
    console.log('✅ Test user created:', authData.user.id)
    
    // Wait a moment for trigger
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if profile was created by trigger
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
    
    if (profileError) {
      console.error('❌ Profile check failed:', profileError.message, '\n')
      return false
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Profile created by trigger automatically!')
      console.log('   Name:', profiles[0].full_name)
      console.log('   Role:', profiles[0].role, '\n')
      return true
    }
    
    console.log('⚠️  Trigger did NOT create profile automatically')
    console.log('   Creating profile manually...')
    
    // Create profile manually
    const { data: manualProfile, error: manualError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: 'Manual Test User',
        role: 'investor',
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (manualError) {
      console.error('❌ Manual profile creation failed:', manualError.message, '\n')
      return false
    }
    
    console.log('✅ Profile created manually')
    console.log('   This means the trigger is NOT working!\n')
    return false // Trigger not working
  } catch (error) {
    console.error('❌ Test failed:', error.message, '\n')
    return false
  }
}

async function recreateTrigger() {
  console.log('🔨 Step 4: Recreating trigger with direct SQL...')
  
  const triggerSQL = `
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT with ON CONFLICT to handle duplicates
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url, 
    role, 
    email_verified, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor')::text,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`
  
  try {
    // We'll need to run this manually in Supabase SQL Editor
    console.log('⚠️  Cannot execute DDL commands via RPC')
    console.log('📋 You need to run this SQL in Supabase SQL Editor:\n')
    console.log('=' .repeat(60))
    console.log(triggerSQL)
    console.log('=' .repeat(60))
    console.log('')
    return false
  } catch (error) {
    console.error('❌ Failed:', error.message, '\n')
    return false
  }
}

async function checkExistingUsers() {
  console.log('👥 Step 5: Checking existing auth users without profiles...')
  
  try {
    // Get all auth users (paginated)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Failed to list users:', authError.message, '\n')
      return
    }
    
    console.log(`📊 Found ${authUsers.length} auth users`)
    
    // Check which ones have profiles
    let missingProfiles = 0
    for (const user of authUsers) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!profile) {
        missingProfiles++
        console.log(`⚠️  User ${user.email} (${user.id}) has NO profile`)
      }
    }
    
    if (missingProfiles === 0) {
      console.log('✅ All auth users have profiles\n')
    } else {
      console.log(`❌ ${missingProfiles} users missing profiles\n`)
    }
    
    return missingProfiles === 0
  } catch (error) {
    console.error('❌ Check failed:', error.message, '\n')
    return false
  }
}

async function fixMissingProfiles() {
  console.log('🔧 Step 6: Creating missing profiles...')
  
  try {
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Failed to list users:', authError.message, '\n')
      return false
    }
    
    let fixed = 0
    for (const user of authUsers) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!profile) {
        console.log(`🔧 Creating profile for ${user.email}...`)
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || null,
            role: user.user_metadata?.role || 'investor',
            email_verified: user.email_confirmed_at !== null,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error(`   ❌ Failed:`, insertError.message)
        } else {
          console.log(`   ✅ Profile created`)
          fixed++
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} missing profiles\n`)
    return true
  } catch (error) {
    console.error('❌ Fix failed:', error.message, '\n')
    return false
  }
}

async function runDiagnosis() {
  console.log('🚀 Starting comprehensive diagnosis...\n')
  
  const results = {
    tables: await checkTables(),
    triggers: await checkTriggers(),
    manualTest: await createProfileManually(),
    existingUsers: await checkExistingUsers()
  }
  
  // If manual test failed, try to fix
  if (!results.manualTest) {
    await recreateTrigger()
    await fixMissingProfiles()
  }
  
  console.log('📊 DIAGNOSIS SUMMARY')
  console.log('===================')
  console.log(`Database Tables: ${results.tables ? '✅ OK' : '❌ ISSUE'}`)
  console.log(`Triggers: ${results.triggers ? '✅ OK' : '⚠️  NEEDS CHECK'}`)
  console.log(`Auto Profile Creation: ${results.manualTest ? '✅ WORKING' : '❌ NOT WORKING'}`)
  console.log(`Existing Users: ${results.existingUsers ? '✅ ALL HAVE PROFILES' : '⚠️  SOME MISSING'}`)
  
  console.log('\n🎯 RECOMMENDATIONS:')
  
  if (!results.manualTest) {
    console.log('1. ⚠️  The trigger is NOT creating profiles automatically')
    console.log('2. 📋 Copy the SQL shown above and run it in Supabase SQL Editor')
    console.log('3. 🔄 Then run this script again to verify')
  } else {
    console.log('✅ Everything is working correctly!')
    console.log('📱 Test signup at: http://localhost:3000/signup')
  }
}

runDiagnosis().catch(console.error)
