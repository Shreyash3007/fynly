/**
 * Automated Database Setup Script
 * Runs database migrations and setup on remote Supabase project
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

console.log('🗄️  SUPABASE DATABASE AUTOMATED SETUP')
console.log('=' .repeat(50))
console.log(`Project: ${PROJECT_REF}`)
console.log('')

// Check if Supabase CLI is available
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' })
    return true
  } catch {
    console.error('❌ Supabase CLI not found. Install with: npm install -g supabase')
    return false
  }
}

// Check if project is linked
function checkProjectLinked() {
  try {
    execSync('supabase projects list', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// Run SQL file via Supabase CLI or direct API
async function runSQLFile(filePath) {
  console.log(`\n📄 Running: ${path.basename(filePath)}`)
  
  const sql = fs.readFileSync(filePath, 'utf-8')
  
  try {
    // Try using Supabase CLI
    if (checkProjectLinked()) {
      // Save to temp migration file
      const tempFile = path.join(process.cwd(), 'supabase', 'migrations', `temp_${Date.now()}.sql`)
      fs.writeFileSync(tempFile, sql)
      
      try {
        execSync('supabase db push', { stdio: 'inherit', cwd: process.cwd() })
        fs.unlinkSync(tempFile)
        console.log('✅ Migration applied via CLI')
        return true
      } catch {
        fs.unlinkSync(tempFile)
        throw new Error('CLI push failed')
      }
    } else {
      throw new Error('Project not linked')
    }
  } catch (error) {
    console.log('⚠️  CLI method failed. Use SQL Editor instead:')
    console.log(`   1. Open: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    console.log(`   2. Copy contents of: ${filePath}`)
    console.log(`   3. Run the SQL script`)
    return false
  }
}

// Main setup
async function setupDatabase() {
  if (!checkSupabaseCLI()) {
    console.log('\n💡 Alternative: Use Supabase SQL Editor')
    console.log(`   URL: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    console.log('\n   Run these files in order:')
    console.log('   1. supabase/setup-database.sql')
    return
  }

  if (!checkProjectLinked()) {
    console.log('\n⚠️  Project not linked to Supabase CLI')
    console.log('   Run: supabase link --project-ref ' + PROJECT_REF)
    console.log('\n💡 Or use SQL Editor:')
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
    return
  }

  console.log('\n📋 Setup Database Scripts:')
  console.log('=' .repeat(50))

  const setupFile = path.join(process.cwd(), 'supabase', 'setup-database.sql')
  
  if (fs.existsSync(setupFile)) {
    console.log('\n🚀 Running main setup script...')
    await runSQLFile(setupFile)
  } else {
    console.log('❌ setup-database.sql not found')
  }

  console.log('\n✅ Database setup script execution completed!')
  console.log('\n📊 Verify in dashboard:')
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/editor`)
}

setupDatabase().catch(console.error)

