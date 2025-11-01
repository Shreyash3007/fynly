/**
 * Create Demo Users Script
 * Creates 10 fake advisors and 10 fake investors with login credentials
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Realistic Indian names for advisors
const advisorNames = [
  { first: 'Rajesh', last: 'Kumar', email: 'rajesh.kumar@advisors.fynly.demo' },
  { first: 'Priya', last: 'Sharma', email: 'priya.sharma@advisors.fynly.demo' },
  { first: 'Amit', last: 'Patel', email: 'amit.patel@advisors.fynly.demo' },
  { first: 'Neha', last: 'Gupta', email: 'neha.gupta@advisors.fynly.demo' },
  { first: 'Vikram', last: 'Singh', email: 'vikram.singh@advisors.fynly.demo' },
  { first: 'Anjali', last: 'Mehta', email: 'anjali.mehta@advisors.fynly.demo' },
  { first: 'Rohan', last: 'Desai', email: 'rohan.desai@advisors.fynly.demo' },
  { first: 'Kavita', last: 'Reddy', email: 'kavita.reddy@advisors.fynly.demo' },
  { first: 'Arjun', last: 'Nair', email: 'arjun.nair@advisors.fynly.demo' },
  { first: 'Sneha', last: 'Iyer', email: 'sneha.iyer@advisors.fynly.demo' },
]

// Realistic Indian names for investors
const investorNames = [
  { first: 'Rahul', last: 'Jain', email: 'rahul.jain@investors.fynly.demo' },
  { first: 'Sonia', last: 'Verma', email: 'sonia.verma@investors.fynly.demo' },
  { first: 'Karan', last: 'Malhotra', email: 'karan.malhotra@investors.fynly.demo' },
  { first: 'Divya', last: 'Kapoor', email: 'divya.kapoor@investors.fynly.demo' },
  { first: 'Aditya', last: 'Bansal', email: 'aditya.bansal@investors.fynly.demo' },
  { first: 'Meera', last: 'Chopra', email: 'meera.chopra@investors.fynly.demo' },
  { first: 'Siddharth', last: 'Agarwal', email: 'siddharth.agarwal@investors.fynly.demo' },
  { first: 'Isha', last: 'Shah', email: 'isha.shah@investors.fynly.demo' },
  { first: 'Varun', last: 'Joshi', email: 'varun.joshi@investors.fynly.demo' },
  { first: 'Pooja', last: 'Bhatia', email: 'pooja.bhatia@investors.fynly.demo' },
]

// Expertise areas (must match database enum or be lowercase strings)
const expertiseAreas = [
  'equity',
  'mutual_funds',
  'fixed_income',
  'portfolio_management',
  'retirement_planning',
  'tax_planning',
  'wealth_management',
  'insurance',
  'real_estate',
  'crypto'
]

// Generate phone number
function generatePhone() {
  return `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`
}

// Generate SEBI registration number (format: IN[A-Z][0-9]{9} - matches constraint)
function generateSebiReg() {
  const prefix = 'IN'
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter = letters[Math.floor(Math.random() * letters.length)]
  const numbers = String(Math.floor(100000000 + Math.random() * 900000000)).padStart(9, '0')
  return `${prefix}${letter}${numbers}`
}

// Create a user in auth and profile
async function createUser(name, role, isAdvisor = false) {
  const password = 'Demo@123' // Same password for all demo users
  const fullName = `${name.first} ${name.last}`
  const phone = generatePhone()

  try {
    // Check if user already exists
    let userId
    let userExists = false
    
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === name.email)
    
    if (existingUser) {
      userId = existingUser.id
      userExists = true
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: name.email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
          role: role,
        }
      })

      if (authError) {
        console.error(`Failed to create auth user ${name.email}:`, authError.message)
        return null
      }

      if (!authData.user) {
        console.error(`No user returned for ${name.email}`)
        return null
      }

      userId = authData.user.id
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: name.email,
        full_name: fullName,
        phone: phone,
        role: role,
        email_verified: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error(`Failed to create profile for ${name.email}:`, profileError.message)
      return { userId, email: name.email, password, name: fullName, role, error: profileError.message }
    }

    // If advisor, create advisor profile
    if (isAdvisor) {
      // Select 2-3 random expertise areas
      const numExpertise = Math.floor(2 + Math.random() * 2) // 2-3 expertise areas
      const shuffled = [...expertiseAreas].sort(() => 0.5 - Math.random())
      const selectedExpertise = shuffled.slice(0, numExpertise)
      
      const hourlyRate = Math.floor(500 + Math.random() * 4500) // ₹500 - ₹5000
      const experienceYears = Math.floor(5 + Math.random() * 15) // 5-20 years
      
      // Format expertise for bio
      const expertiseDisplay = selectedExpertise.map(e => {
        return e.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      }).join(', ')
      
      const bio = `${fullName} is a certified SEBI registered investment advisor with ${experienceYears} years of experience. Specializes in ${expertiseDisplay}. Helps clients build wealth through strategic investment planning.`
      
      const sebiRegNo = generateSebiReg()

      // Check if advisor profile exists
      const { data: existingAdvisor } = await supabase
        .from('advisors')
        .select('id, status')
        .eq('user_id', userId)
        .single()
      
      const advisorData = {
        user_id: userId,
        expertise: selectedExpertise,
        hourly_rate: hourlyRate,
        experience_years: experienceYears,
        bio: bio,
        sebi_reg_no: sebiRegNo,
        status: 'approved', // Auto-approve for demo
        updated_at: new Date().toISOString(),
      }
      
      // Only set created_at if creating new
      if (!existingAdvisor) {
        advisorData.created_at = new Date().toISOString()
      }
      
      const { error: advisorError } = await supabase
        .from('advisors')
        .upsert(advisorData, {
          onConflict: 'user_id'
        })

      if (advisorError) {
        console.error(`Failed to create advisor profile for ${name.email}:`, advisorError.message)
        return { userId, email: name.email, password, name: fullName, role, expertise: selectedExpertise, hourlyRate, experienceYears, error: advisorError.message }
      }

      return {
        userId,
        email: name.email,
        password,
        name: fullName,
        role,
        expertise: expertiseDisplay,
        hourlyRate: `₹${hourlyRate}`,
        experienceYears,
        sebiRegNo,
        phone
      }
    }

    return {
      userId,
      email: name.email,
      password,
      name: fullName,
      role,
      phone
    }
  } catch (error) {
    console.error(`Error creating user ${name.email}:`, error.message)
    return { email: name.email, password, name: fullName, role, error: error.message }
  }
}

// Main execution
async function main() {
  console.log('🚀 Creating demo users...\n')
  console.log('='.repeat(60))
  
  const credentials = {
    advisors: [],
    investors: []
  }

  // Create advisors
  console.log('\n📊 Creating Advisors...\n')
    for (let i = 0; i < advisorNames.length; i++) {
      const name = advisorNames[i]
      console.log(`Creating advisor ${i + 1}/10: ${name.first} ${name.last}...`)
      
      const result = await createUser(name, 'advisor', true)
      if (result) {
        credentials.advisors.push(result)
        if (result.error) {
          console.log(`  ⚠️  ${result.error}`)
        } else {
          console.log(`  ✅ Ready: ${result.email}`)
        }
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300))
    }

  // Create investors
  console.log('\n💰 Creating Investors...\n')
    for (let i = 0; i < investorNames.length; i++) {
      const name = investorNames[i]
      console.log(`Creating investor ${i + 1}/10: ${name.first} ${name.last}...`)
      
      const result = await createUser(name, 'investor', false)
      if (result) {
        credentials.investors.push(result)
        if (result.error) {
          console.log(`  ⚠️  ${result.error}`)
        } else {
          console.log(`  ✅ Ready: ${result.email}`)
        }
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300))
    }

  // Display credentials
  console.log('\n' + '='.repeat(60))
  console.log('\n✅ Demo Users Created Successfully!\n')
  console.log('📋 LOGIN CREDENTIALS\n')
  console.log('='.repeat(60))
  
  console.log('\n📊 ADVISORS (10 users)\n')
  console.log('Password for all: Demo@123\n')
  credentials.advisors.forEach((advisor, index) => {
    if (!advisor.error) {
      console.log(`${index + 1}. ${advisor.name}`)
      console.log(`   Email: ${advisor.email}`)
      console.log(`   Password: ${advisor.password}`)
      console.log(`   Expertise: ${advisor.expertise}`)
      console.log(`   Hourly Rate: ${advisor.hourlyRate}/hour`)
      console.log(`   Experience: ${advisor.experienceYears} years`)
      console.log(`   SEBI Reg: ${advisor.sebiRegNo}`)
      console.log('')
    }
  })

  console.log('\n💰 INVESTORS (10 users)\n')
  console.log('Password for all: Demo@123\n')
  credentials.investors.forEach((investor, index) => {
    if (!investor.error) {
      console.log(`${index + 1}. ${investor.name}`)
      console.log(`   Email: ${investor.email}`)
      console.log(`   Password: ${investor.password}`)
      console.log('')
    }
  })

  // Save to file
  const fs = require('fs')
  const credentialsFile = 'DEMO_USER_CREDENTIALS.md'
  
  let markdown = '# Demo User Credentials\n\n'
  markdown += '**Created:** ' + new Date().toISOString() + '\n\n'
  markdown += '> **Password for all users:** `Demo@123`\n\n'
  
  markdown += '## 📊 Advisors (10 users)\n\n'
  credentials.advisors.forEach((advisor, index) => {
    if (!advisor.error) {
      markdown += `### ${index + 1}. ${advisor.name}\n`
      markdown += `- **Email:** \`${advisor.email}\`\n`
      markdown += `- **Password:** \`${advisor.password}\`\n`
      markdown += `- **Expertise:** ${advisor.expertise}\n`
      markdown += `- **Hourly Rate:** ${advisor.hourlyRate}/hour\n`
      markdown += `- **Experience:** ${advisor.experienceYears} years\n`
      markdown += `- **SEBI Registration:** ${advisor.sebiRegNo}\n`
      markdown += `- **Phone:** ${advisor.phone}\n\n`
    }
  })
  
  markdown += '## 💰 Investors (10 users)\n\n'
  credentials.investors.forEach((investor, index) => {
    if (!investor.error) {
      markdown += `### ${index + 1}. ${investor.name}\n`
      markdown += `- **Email:** \`${investor.email}\`\n`
      markdown += `- **Password:** \`${investor.password}\`\n`
      markdown += `- **Phone:** ${investor.phone}\n\n`
    }
  })
  
  fs.writeFileSync(credentialsFile, markdown)
  console.log(`\n💾 Credentials saved to: ${credentialsFile}\n`)
  console.log('='.repeat(60))
}

// Run the script
main().catch(console.error)

