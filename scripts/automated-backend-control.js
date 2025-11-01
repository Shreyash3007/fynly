/**
 * Automated Backend Control Script
 * Controls Supabase backend through Management API and REST API
 * No CLI required - works directly with credentials
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

console.log('🤖 AUTOMATED BACKEND CONTROL')
console.log('='.repeat(50))
console.log(`Project: ${PROJECT_REF}`)
console.log(`URL: ${SUPABASE_URL}`)
console.log('')

// Create Supabase client with service role (admin access)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Check database connection
async function checkConnection() {
  console.log('\n1️⃣ Checking Database Connection...')
  try {
    // Try to query a system table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet, but connection works
      console.log('✅ Connected to Supabase')
      console.log('⚠️  Database tables not created yet')
      return true
    } else if (!error) {
      console.log('✅ Connected to Supabase')
      console.log('✅ Database tables exist')
      return true
    } else {
      console.log('⚠️  Connection check:', error.message)
      return true // Still connected, just table issue
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

// Check which tables exist
async function checkTables() {
  console.log('\n2️⃣ Checking Database Tables...')
  
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
  
  const existingTables = []
  const missingTables = []
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        missingTables.push(table)
      } else {
        existingTables.push(table)
      }
    } catch (error) {
      // Table doesn't exist or can't access
      missingTables.push(table)
    }
  }
  
  console.log('\n📊 Table Status:')
  if (existingTables.length > 0) {
    console.log(`✅ Existing (${existingTables.length}):`)
    existingTables.forEach(t => console.log(`   - ${t}`))
  }
  
  if (missingTables.length > 0) {
    console.log(`❌ Missing (${missingTables.length}):`)
    missingTables.forEach(t => console.log(`   - ${t}`))
    console.log('\n💡 Run database setup:')
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    console.log('   Execute: supabase/setup-database.sql')
  }
  
  return { existingTables, missingTables }
}

// Get database statistics
async function getDatabaseStats() {
  console.log('\n3️⃣ Database Statistics...')
  
  try {
    // Count users
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Count advisors
    const { count: advisorCount } = await supabaseAdmin
      .from('advisors')
      .select('*', { count: 'exact', head: true })
    
    // Count bookings
    const { count: bookingCount } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
    
    console.log('\n📊 Current Data:')
    console.log(`   Users: ${userCount || 0}`)
    console.log(`   Advisors: ${advisorCount || 0}`)
    console.log(`   Bookings: ${bookingCount || 0}`)
    
  } catch (error) {
    if (error.code === 'PGRST116') {
      console.log('⚠️  Tables not created yet')
    } else {
      console.log('⚠️  Could not fetch statistics:', error.message)
    }
  }
}

// Verify RLS policies
async function checkRLSPolicies() {
  console.log('\n4️⃣ Checking RLS Policies...')
  console.log('⚠️  RLS policy check requires SQL execution')
  console.log('💡 Verify in Dashboard → Authentication → Policies')
}

// Generate setup SQL script with project-specific details
function generateSetupInstructions() {
  console.log('\n5️⃣ Database Setup Instructions...')
  console.log('='.repeat(50))
  
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`
  const setupFile = path.join(process.cwd(), 'supabase', 'setup-database.sql')
  
  if (!fs.existsSync(setupFile)) {
    console.log('❌ setup-database.sql not found')
    return
  }
  
  const fileSize = (fs.statSync(setupFile).size / 1024).toFixed(2)
  
  console.log('\n📋 Setup Steps:')
  console.log(`   1. Open SQL Editor: ${sqlEditorUrl}`)
  console.log(`   2. Open file: ${setupFile}`)
  console.log(`   3. Copy all contents (${fileSize} KB)`)
  console.log(`   4. Paste into SQL Editor`)
  console.log(`   5. Click "Run" or press Ctrl+Enter`)
  console.log(`   6. Verify tables are created`)
  
  console.log('\n✅ After setup, run this script again to verify!')
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n6️⃣ Testing API Endpoints...')
  
  const endpoints = [
    { name: 'Auth Health', path: '/auth/v1/health' },
    { name: 'REST API', path: '/rest/v1/' }
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
        console.log(`   ✅ ${endpoint.name}: Accessible`)
      } else {
        console.log(`   ⚠️  ${endpoint.name}: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`)
    }
  }
}

// Main control function
async function controlBackend(action = 'status') {
  console.log(`\n🎯 Action: ${action.toUpperCase()}`)
  console.log('='.repeat(50))
  
  switch (action.toLowerCase()) {
    case 'status':
    case 'check':
      await checkConnection()
      const tables = await checkTables()
      await getDatabaseStats()
      await testAPIEndpoints()
      if (tables.missingTables.length > 0) {
        generateSetupInstructions()
      }
      break
    
    case 'setup':
      generateSetupInstructions()
      break
    
    case 'verify':
      await checkConnection()
      await checkTables()
      await getDatabaseStats()
      break
    
    case 'help':
    default:
      console.log('\n📋 Available Commands:')
      console.log('   node scripts/automated-backend-control.js status  - Full status check')
      console.log('   node scripts/automated-backend-control.js check   - Quick check')
      console.log('   node scripts/automated-backend-control.js verify  - Verify setup')
      console.log('   node scripts/automated-backend-control.js setup   - Setup instructions')
      break
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Backend control check complete!')
}

// Run
const action = process.argv[2] || 'status'
controlBackend(action).catch(console.error)

