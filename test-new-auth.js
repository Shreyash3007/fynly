/**
 * Test New Supabase Authentication
 * Verify the new Supabase setup is working correctly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Testing New Supabase Configuration')
console.log('=====================================')
console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? 'Set ✅' : 'Not Set ❌')
console.log('Service Key:', supabaseServiceKey ? 'Set ✅' : 'Not Set ❌')
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Use anon key for auth operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)
// Use service key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

async function testConnection() {
  console.log('1️⃣ Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connected successfully\n')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message, '\n')
    return false
  }
}

async function testSignup() {
  console.log('2️⃣ Testing user signup...')
  
  const testEmail = `test-${Date.now()}@fynly.com`
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
      console.error('❌ Signup failed:', error.message, '\n')
      return false
    }
    
    console.log('✅ User created:', data.user?.id)
    console.log('📧 Email:', testEmail)
    console.log('✉️  Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No (check email)')
    
    // Wait longer for trigger to create profile
    console.log('⏳ Waiting for trigger to create profile...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check profile using admin client (service role has full access)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
    
    if (profileError) {
      console.error('❌ Profile query error:', profileError.message, '\n')
      return false
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('❌ Profile not created\n')
      return false
    }
    
    const profile = profiles[0]
    console.log('✅ Profile created automatically')
    console.log('👤 Name:', profile.full_name)
    console.log('🎭 Role:', profile.role)
    console.log('✉️  Email verified:', profile.email_verified)
    
    // Check for duplicates
    if (profiles.length > 1) {
      console.log('⚠️  Warning: Found', profiles.length, 'profiles for this user (should be 1)')
    }
    console.log('')
    
    return true
  } catch (error) {
    console.error('❌ Signup test failed:', error.message, '\n')
    return false
  }
}

async function testLogin() {
  console.log('3️⃣ Testing user login...')
  
  // Just test the function, don't expect success without a registered user
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@test.com',
      password: 'test123'
    })
    
    if (error && error.message.includes('Invalid login credentials')) {
      console.log('✅ Login function working (credentials validation works)\n')
      return true
    }
    
    return false
  } catch (error) {
    console.error('❌ Login test failed:', error.message, '\n')
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase Authentication Tests\n')
  
  const results = {
    connection: await testConnection(),
    signup: await testSignup(),
    login: await testLogin()
  }
  
  console.log('📊 TEST RESULTS')
  console.log('===============')
  console.log(`Database Connection: ${results.connection ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`User Signup: ${results.signup ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Login Function: ${results.login ? '✅ PASSED' : '❌ FAILED'}`)
  
  const allPassed = Object.values(results).every(r => r)
  console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}`)
  
  if (allPassed) {
    console.log('\n🎉 Your Supabase setup is working perfectly!')
    console.log('📱 Test the UI at: http://localhost:3000/signup')
  } else {
    console.log('\n⚠️  Some tests failed. Please:')
    console.log('1. Run the setup-database.sql script in Supabase SQL Editor')
    console.log('2. Verify environment variables are correct')
    console.log('3. Check Supabase dashboard for any errors')
  }
}

runAllTests().catch(console.error)
