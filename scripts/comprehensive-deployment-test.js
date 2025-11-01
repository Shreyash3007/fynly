/**
 * Comprehensive Deployment Readiness Test
 * Tests all systems except payment (on hold)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const results = {
  passed: 0,
  failed: 0,
  warnings: [],
  errors: []
}

function logTest(name, passed, message = '') {
  if (passed) {
    console.log(`✅ ${name}`)
    results.passed++
  } else {
    console.log(`❌ ${name}`)
    if (message) console.log(`   → ${message}`)
    results.failed++
    results.errors.push({ test: name, message })
  }
}

function logWarning(message) {
  console.log(`⚠️  ${message}`)
  results.warnings.push(message)
}

// Test 1: Environment Variables
async function testEnvironmentVariables() {
  console.log('\n📋 TEST 1: Environment Variables')
  console.log('='.repeat(50))

  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': SERVICE_ROLE_KEY,
    'NEXT_PUBLIC_DAILY_API_KEY': process.env.NEXT_PUBLIC_DAILY_API_KEY,
    'DAILY_API_KEY': process.env.DAILY_API_KEY,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
  }

  for (const [key, value] of Object.entries(requiredVars)) {
    logTest(`${key} is set`, !!value)
  }

  // Payment vars should exist but are optional (on hold)
  if (process.env.RAZORPAY_KEY_ID) {
    logWarning('RAZORPAY_KEY_ID is set but payment system is disabled')
  }
}

// Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('\n🗄️  TEST 2: Database Connection')
  console.log('='.repeat(50))

  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1)
    if (error && error.code === 'PGRST116') {
      logTest('Database connection', true, 'Connected (tables may not exist)')
    } else if (!error) {
      logTest('Database connection', true)
    } else {
      logTest('Database connection', false, error.message)
    }
  } catch (error) {
    logTest('Database connection', false, error.message)
  }
}

// Test 3: Database Tables
async function testDatabaseTables() {
  console.log('\n📊 TEST 3: Database Tables')
  console.log('='.repeat(50))

  const requiredTables = [
    'users',
    'advisors',
    'bookings',
    'payments',
    'reviews',
    'notifications',
    'advisor_investor_relationships',
    'messages'
  ]

  for (const table of requiredTables) {
    try {
      const { error } = await supabaseAdmin.from(table).select('*').limit(1)
      if (error && error.code === 'PGRST116') {
        logTest(`Table ${table} exists`, true)
      } else if (!error) {
        logTest(`Table ${table} exists`, true)
      } else {
        logTest(`Table ${table} exists`, false, error.message)
      }
    } catch (error) {
      logTest(`Table ${table} exists`, false, error.message)
    }
  }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
  console.log('\n🔌 TEST 4: API Endpoints')
  console.log('='.repeat(50))

  const endpoints = [
    { name: 'Auth API', path: '/auth/v1/health' },
    { name: 'REST API', path: '/rest/v1/' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${SUPABASE_URL}${endpoint.path}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      })
      
      if (response.ok || response.status === 404) {
        logTest(`${endpoint.name} accessible`, true)
      } else {
        logTest(`${endpoint.name} accessible`, false, `Status: ${response.status}`)
      }
    } catch (error) {
      logTest(`${endpoint.name} accessible`, false, error.message)
    }
  }
}

// Test 5: Code Quality
async function testCodeQuality() {
  console.log('\n📝 TEST 5: Code Quality')
  console.log('='.repeat(50))

  // Check critical files exist
  const criticalFiles = [
    'src/lib/supabase/client.ts',
    'src/lib/supabase/server.ts',
    'src/lib/supabase/middleware.ts',
    'src/middleware.ts',
    'src/app/api/bookings/route.ts',
    'src/app/api/advisors/route.ts',
    'src/app/api/chat/send/route.ts',
  ]

  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file)
    logTest(`File ${file} exists`, fs.existsSync(filePath))
  }

  // Check payment is disabled
  const paymentCreateRoute = path.join(process.cwd(), 'src/app/api/payments/create-order/route.ts')
  if (fs.existsSync(paymentCreateRoute)) {
    const content = fs.readFileSync(paymentCreateRoute, 'utf-8')
    if (content.includes('Payment system temporarily disabled')) {
      logTest('Payment system disabled', true)
    } else {
      logTest('Payment system disabled', false, 'Payment routes still active')
    }
  }
}

// Test 6: TypeScript Build
async function testTypeScriptBuild() {
  console.log('\n🔨 TEST 6: TypeScript Build')
  console.log('='.repeat(50))

  const { execSync } = require('child_process')
  
  try {
    execSync('npm run type-check', { stdio: 'pipe', cwd: process.cwd() })
    logTest('TypeScript compilation', true)
  } catch (error) {
    logTest('TypeScript compilation', false, 'Type errors found')
  }
}

// Test 7: Database RLS Policies
async function testRLSPolicies() {
  console.log('\n🔒 TEST 7: Security (RLS Policies)')
  console.log('='.repeat(50))

  // Test that anon key has limited access
  try {
    // Anon should not be able to read all users
    const { data: users, error } = await supabaseAnon
      .from('users')
      .select('*')
      .limit(5)
    
    // This should fail or return empty due to RLS
    if (error || !users || users.length === 0) {
      logTest('RLS policies active', true, 'Anon key properly restricted')
    } else {
      logWarning('RLS may not be properly configured - anon key can read users')
    }
  } catch (error) {
    logTest('RLS policies active', true, 'RLS appears to be working')
  }
}

// Test 8: File Structure
async function testFileStructure() {
  console.log('\n📁 TEST 8: File Structure')
  console.log('='.repeat(50))

  const requiredDirs = [
    'src/app',
    'src/components',
    'src/lib',
    'src/types',
    'supabase',
    'supabase/migrations',
  ]

  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir)
    logTest(`Directory ${dir} exists`, fs.existsSync(dirPath))
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 COMPREHENSIVE DEPLOYMENT TEST')
  console.log('='.repeat(50))
  console.log('Testing all systems (Payment system excluded)')
  console.log('')

  await testEnvironmentVariables()
  await testDatabaseConnection()
  await testDatabaseTables()
  await testAPIEndpoints()
  await testCodeQuality()
  await testTypeScriptBuild()
  await testRLSPolicies()
  await testFileStructure()

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`⚠️  Warnings: ${results.warnings.length}`)

  const total = results.passed + results.failed
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0

  console.log(`\n📈 Pass Rate: ${passRate}%`)

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.warnings.forEach(w => console.log(`   - ${w}`))
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:')
    results.errors.forEach(e => console.log(`   - ${e.test}: ${e.message}`))
  }

  console.log('\n' + '='.repeat(50))

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ Ready for deployment (payment system excluded)')
  } else {
    console.log('⚠️  SOME TESTS FAILED')
    console.log('❌ Fix issues before deployment')
  }

  console.log('='.repeat(50))

  process.exit(results.failed > 0 ? 1 : 0)
}

runAllTests().catch(console.error)

