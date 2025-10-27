/**
 * Authentication Test Script
 * Test the authentication system without running the full app
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database error:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function testAuthConnection() {
  console.log('🔍 Testing auth connection...')
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth error:', error.message)
      return false
    }
    
    console.log('✅ Auth connection successful')
    console.log('📊 Current session:', session ? 'Active' : 'None')
    return true
  } catch (error) {
    console.error('❌ Auth connection failed:', error.message)
    return false
  }
}

async function testSignUp() {
  console.log('🔍 Testing signup...')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'investor'
        }
      }
    })
    
    if (error) {
      console.error('❌ Signup error:', error.message)
      return false
    }
    
    console.log('✅ Signup successful')
    console.log('📊 User ID:', data.user?.id)
    console.log('📊 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
    
    return true
  } catch (error) {
    console.error('❌ Signup failed:', error.message)
    return false
  }
}

async function testProfileCreation() {
  console.log('🔍 Testing profile creation...')
  
  try {
    // First, get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('⚠️  No authenticated user, skipping profile test')
      return true
    }
    
    // Try to create a profile
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Test User',
      avatar_url: user.user_metadata?.avatar_url || null,
      role: 'investor',
      email_verified: user.email_confirmed_at !== null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        console.log('✅ Profile already exists (expected)')
        return true
      }
      console.error('❌ Profile creation error:', error.message)
      return false
    }
    
    console.log('✅ Profile created successfully')
    return true
  } catch (error) {
    console.error('❌ Profile creation failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting authentication tests...\n')
  
  const results = {
    database: await testDatabaseConnection(),
    auth: await testAuthConnection(),
    signup: await testSignUp(),
    profile: await testProfileCreation()
  }
  
  console.log('\n📊 Test Results:')
  console.log('================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  const allPassed = Object.values(results).every(result => result)
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`)
  
  if (!allPassed) {
    console.log('\n🔧 Next steps:')
    console.log('1. Check Supabase project settings')
    console.log('2. Verify RLS policies are correct')
    console.log('3. Check if users table exists and has correct schema')
    console.log('4. Verify environment variables are correct')
  }
}

runAllTests().catch(console.error)
