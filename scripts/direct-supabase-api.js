/**
 * Direct Supabase API Management Script
 * Uses Supabase Management API to control project without CLI
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

console.log('🚀 DIRECT SUPABASE API MANAGEMENT')
console.log('=' .repeat(50))
console.log(`Project: ${PROJECT_REF}`)
console.log(`URL: ${SUPABASE_URL}`)
console.log('')

// Execute SQL via REST API
async function executeSQL(sql, description = 'SQL Query') {
  console.log(`\n📄 ${description}`)
  console.log('=' .repeat(50))

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
    console.log('\n💡 To execute SQL, use Supabase Dashboard:')
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    return false
  }

  // Note: Supabase REST API doesn't support direct SQL execution
  // We'll provide instructions for SQL Editor instead
  console.log('⚠️  Supabase REST API doesn\'t support direct SQL execution')
  console.log('\n✅ Use Supabase SQL Editor to run SQL files:')
  console.log(`   URL: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
  console.log('\n📋 Files to run (in order):')
  console.log('   1. supabase/setup-database.sql')
  
  return false
}

// Check database tables
async function checkTables() {
  console.log('\n📊 Checking database tables...')
  
  if (!SERVICE_ROLE_KEY) {
    console.error('❌ SERVICE_ROLE_KEY required')
    return
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    })

    if (response.ok) {
      console.log('✅ Database connection successful')
    } else {
      console.log('⚠️  Connection check failed')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// List SQL files
function listSQLFiles() {
  console.log('\n📁 Available SQL Scripts:')
  console.log('=' .repeat(50))
  
  const sqlDir = path.join(process.cwd(), 'supabase')
  const files = [
    'setup-database.sql',
    'migrations/add_chat_tables.sql',
    'migrations/fix_meeting_time_column.sql',
    'migrations/consolidated_optimization.sql'
  ]

  files.forEach((file) => {
    const filePath = path.join(sqlDir, file)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      console.log(`   ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
    } else {
      console.log(`   ❌ ${file} (not found)`)
    }
  })
}

// Generate SQL Editor instructions
function generateSQLInstructions() {
  console.log('\n📋 SUPABASE SETUP INSTRUCTIONS')
  console.log('=' .repeat(50))
  console.log('\n🔗 SQL Editor URL:')
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
  console.log('\n📝 Steps:')
  console.log('   1. Open the SQL Editor URL above')
  console.log('   2. Copy the contents of: supabase/setup-database.sql')
  console.log('   3. Paste into SQL Editor')
  console.log('   4. Click "Run" or press Ctrl+Enter')
  console.log('   5. Verify tables are created')
  console.log('\n✅ After running setup-database.sql, all tables will be created!')
}

// Main function
async function main() {
  const action = process.argv[2] || 'status'

  switch (action) {
    case 'check':
      await checkTables()
      break
    
    case 'setup':
      listSQLFiles()
      generateSQLInstructions()
      break
    
    case 'execute':
      const filePath = process.argv[3] || 'supabase/setup-database.sql'
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, 'utf-8')
        await executeSQL(sql, `Executing ${path.basename(filePath)}`)
      } else {
        console.error(`❌ File not found: ${filePath}`)
      }
      break
    
    default:
      console.log('Available commands:')
      console.log('  node scripts/direct-supabase-api.js check   - Check database connection')
      console.log('  node scripts/direct-supabase-api.js setup   - Show setup instructions')
      console.log('  node scripts/direct-supabase-api.js execute - Show execution instructions')
      break
  }
}

main().catch(console.error)

