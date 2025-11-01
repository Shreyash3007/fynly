/**
 * Automated Supabase CLI Setup and Connection Script
 * Connects to remote Supabase project and manages database
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

console.log('🚀 SUPABASE CLI AUTOMATED SETUP')
console.log('=' .repeat(50))
console.log(`Project URL: ${SUPABASE_URL}`)
console.log(`Project Ref: ${PROJECT_REF}`)
console.log('')

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// Install Supabase CLI
async function installSupabaseCLI() {
  console.log('📦 Installing Supabase CLI...')
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' })
    console.log('✅ Supabase CLI installed successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to install Supabase CLI:', error.message)
    return false
  }
}

// Check project link status
function checkLinkStatus() {
  try {
    const configPath = path.join(process.cwd(), 'supabase', '.temp', 'project-ref')
    if (fs.existsSync(configPath)) {
      const linkedRef = fs.readFileSync(configPath, 'utf-8').trim()
      return linkedRef === PROJECT_REF
    }
  } catch {}
  return false
}

// Main setup function
async function setup() {
  console.log('\n1️⃣ Checking Supabase CLI installation...')
  
  if (!checkSupabaseCLI()) {
    console.log('⚠️  Supabase CLI not found. Installing...')
    const installed = await installSupabaseCLI()
    if (!installed) {
      console.error('❌ Cannot proceed without Supabase CLI')
      process.exit(1)
    }
  } else {
    const version = execSync('supabase --version', { encoding: 'utf-8' }).trim()
    console.log(`✅ Supabase CLI installed: ${version}`)
  }

  console.log('\n2️⃣ Checking project link status...')
  
  // Check if already linked
  try {
    execSync('supabase status', { stdio: 'pipe', cwd: process.cwd() })
    console.log('✅ Project configuration exists')
  } catch {
    console.log('⚠️  Project not initialized. Run supabase init first if needed.')
  }

  console.log('\n3️⃣ Next Steps:')
  console.log('=' .repeat(50))
  console.log('\nTo connect to your remote project, you need to:')
  console.log('\n1. Login to Supabase CLI:')
  console.log('   supabase login')
  console.log('   (You\'ll need an access token from: https://supabase.com/dashboard/account/tokens)')
  console.log('\n2. Link to your project:')
  console.log(`   supabase link --project-ref ${PROJECT_REF}`)
  console.log('\n3. Push database migrations:')
  console.log('   supabase db push')
  console.log('\n4. Or run setup script directly:')
  console.log('   node scripts/run-database-setup.js')
  console.log('\n' + '=' .repeat(50))

  // Check for access token in environment
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (accessToken) {
    console.log('\n🔑 Access token found in environment!')
    console.log('Attempting automatic login and link...')
    
    try {
      // Login
      execSync(`echo ${accessToken} | supabase login`, { stdio: 'pipe' })
      console.log('✅ Logged in successfully')
      
      // Link project
      execSync(`supabase link --project-ref ${PROJECT_REF} --password ${process.env.SUPABASE_DB_PASSWORD || ''}`, { stdio: 'inherit' })
      console.log('✅ Project linked successfully')
      
    } catch (error) {
      console.log('⚠️  Automatic login/link failed. Please do it manually:')
      console.log('   supabase login')
      console.log(`   supabase link --project-ref ${PROJECT_REF}`)
    }
  }
}

setup().catch(console.error)

