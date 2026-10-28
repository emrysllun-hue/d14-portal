import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteUserButton from '@/components/DeleteUserButton'


// Server Action to create a new user
async function createUser(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rank = formData.get('rank') as string
  const fullName = formData.get('full_name') as string
  const personnelType = formData.get('personnel_type') as string
  const role = formData.get('role') as string

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    return redirect(`/dashboard/settings/users?error=${encodeURIComponent(authError.message)}`)
  }

  if (authData.user) {
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      rank,
      personnel_type: personnelType,
      role
    })

    if (profileError) {
      return redirect(`/dashboard/settings/users?error=${encodeURIComponent(profileError.message)}`)
    }
  }

  revalidatePath('/dashboard/settings/users')
  redirect('/dashboard/settings/users?success=user_created')
}

// Server Action to update a user's role
async function updateRole(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const userId = formData.get('user_id') as string
  const newRole = formData.get('role') as string

  await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
  revalidatePath('/dashboard/settings/users')
}

// Server Action to reset a user's password
async function resetPassword(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  const newPassword = formData.get('new_password') as string

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
  
  if (error) {
    return redirect(`/dashboard/settings/users?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/settings/users')
  redirect('/dashboard/settings/users?success=password_reset')
}

// Server Action to delete a user
async function deleteUser(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Prevent Admin from deleting themselves
  if (user?.id === userId) {
    return redirect('/dashboard/settings/users?error=Cannot delete your own account.')
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return redirect(`/dashboard/settings/users?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/settings/users')
  redirect('/dashboard/settings/users?success=user_deleted')
}

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, success?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const errorMessage = params.error
  const successMessage = params.success
  
  // Security Check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Admin clearance required.</div>
  }

  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      <div className="mb-8">
        <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500">Create accounts, manage roles, and reset passwords for system users.</p>
      </div>

      {/* SUCCESS ALERT BANNER */}
      {successMessage === 'password_reset' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="text-sm text-green-600 mt-1">Password has been successfully reset.</p>
          </div>
        </div>
      )}

      {successMessage === 'user_created' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="text-sm text-green-600 mt-1">New user account created successfully.</p>
          </div>
        </div>
      )}

      {successMessage === 'user_deleted' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="text-sm text-green-600 mt-1">User account has been deleted.</p>
          </div>
        </div>
      )}

      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-red-800">Action Failed</h3>
            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* List of Users */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">System Users</h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {users?.length || 0} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role Access</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Manage Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{u.rank} {u.full_name}</span>
                        <span className="text-xs text-gray-500">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <form action={updateRole} className="flex items-center gap-2">
                        <input type="hidden" name="user_id" value={u.id} />
                        <select 
                          name="role" 
                          defaultValue={u.role} 
                          className={`text-xs font-semibold border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] ${
                            u.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <option value="field_user">Field User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="text-[10px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-wider">
                          Update
                        </button>
                      </form>
                    </td>
                                        <td className="px-6 py-4">
                      {/* Changed from flex-col to flex to put them side-by-side */}
                      <div className="flex items-center justify-end gap-3">
                        
                        {/* Reset Password Form */}
                        <form action={resetPassword} className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={u.id} />
                          <input 
                            type="text" 
                            name="new_password" 
                            placeholder="New Password" 
                            required 
                            minLength={6} 
                            className="text-xs border border-gray-200 rounded-lg p-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50" 
                          />
                          <button type="submit" className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1.5 rounded-lg font-bold border border-blue-200 transition-colors uppercase tracking-wider">
                            Reset
                          </button>
                        </form>

                        {/* Delete User Form */}
                        {user?.id !== u.id && (
                          <form action={deleteUser}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <DeleteUserButton />
                          </form>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <h2 className="font-bold text-gray-800 text-lg">Create New User</h2>
          </div>
          
          <form action={createUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Email Address</label>
              <input type="email" name="email" required placeholder="name@cgdstl.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Temporary Password</label>
              <input type="text" name="password" required minLength={6} placeholder="Min 6 characters" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Rank</label>
                <input type="text" name="rank" placeholder="e.g. CDR" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Type</label>
                <select name="personnel_type" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50">
                  <option value="Officer">Officer</option>
                  <option value="Enlisted">Enlisted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
              <input type="text" name="full_name" placeholder="e.g. Maria Santos" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">System Role</label>
              <select name="role" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2d6b] bg-gray-50">
                <option value="field_user">Field User (Read Only)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[#0b2d6b] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-blue-800 transition-colors mt-2 shadow-sm">
              CREATE ACCOUNT
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}