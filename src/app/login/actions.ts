'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function loginAction(email: string, password: string) {
  const supabase = await createClient()
  
  // Initialize Admin Client to securely read/update lockout status
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Check if the user is currently locked out
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('failed_attempts, locked_until')
    .eq('email', email)
    .single()

  if (profile?.locked_until) {
    const lockedUntil = new Date(profile.locked_until)
    if (lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
      return { error: `Account locked due to multiple failed attempts. Try again in ${minutesLeft} minutes.` }
    }
  }

  // 2. Attempt Login using standard server client to set cookies
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // 3. Handle Failed Attempt
    if (profile) {
      const newAttempts = (profile.failed_attempts || 0) + 1
      
      if (newAttempts >= 3) {
        // Lock for 15 minutes
        const lockTime = new Date(Date.now() + 15 * 60000).toISOString()
        await supabaseAdmin.from('profiles').update({ failed_attempts: newAttempts, locked_until: lockTime }).eq('email', email)
        return { error: 'Account locked for 15 minutes due to 3 failed attempts.' }
      } else {
        await supabaseAdmin.from('profiles').update({ failed_attempts: newAttempts }).eq('email', email)
        return { error: `Invalid credentials. ${3 - newAttempts} attempts remaining.` }
      }
    }
    return { error: 'Invalid login credentials.' }
  }

  // 4. Reset attempts on success
  await supabaseAdmin.from('profiles').update({ failed_attempts: 0, locked_until: null }).eq('email', email)
  
  return { success: true }
}