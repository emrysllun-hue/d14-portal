import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'



// Define a proper type to fix the 'any' errors
type ListItem = {
  id: string;
  name: string;
}

// --- ACTIONS FOR EVERYONE ---

async function updateMyPassword(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const newPassword = formData.get('new_password') as string

  if (!newPassword || newPassword.length < 6) {
    return redirect('/dashboard/settings?error=Password must be at least 6 characters')
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  
  if (error) {
    return redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard/settings?success=Password updated successfully')
}

// --- ACTIONS FOR ADMINS ONLY ---

async function updateMyProfile(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const full_name = formData.get('full_name') as string
  const rank = formData.get('rank') as string

  await supabase.from('profiles').update({ full_name, rank }).eq('id', user?.id)
  
  revalidatePath('/dashboard/settings')
  redirect('/dashboard/settings?success=Profile updated successfully')
}

async function addCategory(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const name = formData.get('name') as string
  if (name) {
    await supabase.from('incident_types').insert({ name })
    revalidatePath('/dashboard/settings')
  }
}

async function addStation(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const name = formData.get('name') as string
  if (name) {
    await supabase.from('stations').insert({ name })
    revalidatePath('/dashboard/settings')
  }
}

async function deleteItem(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const table = formData.get('table') as string
  if (id && table) {
    await supabase.from(table).delete().eq('id', id)
    revalidatePath('/dashboard/settings')
  }
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, success?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const errorMessage = params.error
  const successMessage = params.success
  
  // 1. Fetch Current User and Profile
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
  
  if (!user || !profile) return redirect('/login')

  const isAdmin = profile.role === 'admin'

  // 2. Fetch Admin Data (only if the user is an admin)
  let types: ListItem[] = []
  let stations: ListItem[] = []
  
  if (isAdmin) {
    const { data: t } = await supabase.from('incident_types').select('*').order('name')
    const { data: s } = await supabase.from('stations').select('*').order('name')
    types = t || []
    stations = s || []
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account & Settings</h1>
        <p className="text-gray-500">Manage your personal profile, security, and system configurations.</p>
      </div>

      {/* Success/Error Banners */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-red-800">Action Failed</h3>
            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 className="text-sm font-bold text-green-800">Success</h3>
            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* =========================================
          PERSONAL ACCOUNT SECTION (Everyone)
          ========================================= */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">My Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              My Profile
            </h3>

            {isAdmin ? (
              // Admin can edit their profile
              <form action={updateMyProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                  <input type="text" name="full_name" defaultValue={profile.full_name || ''} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0b2d6b]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rank</label>
                  <input type="text" name="rank" defaultValue={profile.rank || ''} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0b2d6b]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email (Read-only)</label>
                  <input type="email" defaultValue={profile.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <button type="submit" className="mt-2 bg-[#0b2d6b] text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-blue-800 transition-colors">
                  Update Profile
                </button>
              </form>
            ) : (
              // Field User sees read-only info
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="col-span-2 font-bold text-gray-900">{profile.rank} {profile.full_name}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <span className="col-span-2 font-bold text-gray-900">{profile.email}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">Role:</span>
                  <span className="col-span-2 text-blue-600 font-bold uppercase">{profile.role.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-400 italic mt-4">To update your profile details, please contact an Administrator.</p>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Change Password
            </h3>
            <form action={updateMyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
                <input type="password" name="new_password" required minLength={6} placeholder="Enter new password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
              </div>
              <button type="submit" className="mt-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-green-700 transition-colors">
                Update Password
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* =========================================
          ADMIN CONFIGURATIONS (Admins Only)
          ========================================= */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-bold text-purple-800 mb-4 border-b pb-2">Admin Configurations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* User Management Card */}
            <Link href="/dashboard/settings/users" className="group bg-gradient-to-br from-[#0a192f] to-[#112a4a] p-6 rounded-xl shadow-lg border border-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-lg text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <svg className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-1 relative z-10">User Management</h2>
              <p className="text-sm text-blue-200 relative z-10">Create accounts, reset passwords, and manage roles.</p>
            </Link>

            {/* Categories Card */}
            <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col">
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                </div>
                <h2 className="font-bold text-gray-800">Incident Categories</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <form action={addCategory} className="flex gap-2 mb-4">
                  <input type="text" name="name" placeholder="New Category..." required className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none text-sm bg-gray-50" />
                  <button type="submit" className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-semibold text-sm transition-colors">Add</button>
                </form>
                <ul className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {types?.map(t => (
                    <li key={t.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors group">
                      <span className="text-sm font-medium text-gray-700">{t.name}</span>
                      <form action={deleteItem}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="table" value="incident_types" />
                        <button type="submit" className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Stations Card */}
            <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col">
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <h2 className="font-bold text-gray-800">Coast Guard Stations</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <form action={addStation} className="flex gap-2 mb-4">
                  <input type="text" name="name" placeholder="New Station..." required className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none text-sm bg-gray-50" />
                  <button type="submit" className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-semibold text-sm transition-colors">Add</button>
                </form>
                <ul className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {stations?.map(s => (
                    <li key={s.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors group">
                      <span className="text-sm font-medium text-gray-700">{s.name}</span>
                      <form action={deleteItem}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="table" value="stations" />
                        <button type="submit" className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}