/**
 * Fix Old Users - Create Missing Profiles
 * Run this to fix users created before the trigger was working
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Fixing Old Users Without Profiles\n')

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fixAllUsers() {
  try {
    // Get all auth users
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Failed to list users:', authError.message)
      return
    }
    
    console.log(`📊 Found ${authUsers.length} auth users\n`)
    
    let fixed = 0
    let skipped = 0
    
    for (const user of authUsers) {
      // Check if profile exists
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
      } else {
        skipped++
      }
    }
    
    console.log(`\n📊 RESULTS:`)
    console.log(`✅ Fixed: ${fixed}`)
    console.log(`⏭️  Skipped (already had profiles): ${skipped}`)
    console.log(`📊 Total: ${authUsers.length}\n`)
    
    if (fixed > 0) {
      console.log('🎉 All users now have profiles!')
    } else {
      console.log('✅ All users already had profiles!')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixAllUsers().catch(console.error)
