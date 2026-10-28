import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

// Server Action to add a new Category
async function addCategory(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (name) {
    await supabase.from('incident_types').insert({ name })
    revalidatePath('/dashboard/settings')
  }
}

// Server Action to add a new Station
async function addStation(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (name) {
    await supabase.from('stations').insert({ name })
    revalidatePath('/dashboard/settings')
  }
}

// Server Action to delete an item
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

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Security check: Verify user is admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  if (profile?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied. Admin clearance required.
      </div>
    )
  }

  // Fetch current lists
  const { data: types } = await supabase.from('incident_types').select('*').order('name')
  const { data: stations } = await supabase.from('stations').select('*').order('name')

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-gray-500">Manage categories and stations for the D-14 Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Manage Categories */}
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-800">Incident Categories</h2>
          </div>
          <div className="p-4">
            <form action={addCategory} className="flex gap-2 mb-4">
              <input type="text" name="name" placeholder="New Category Name..." required className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none text-sm" />
              <button type="submit" className="bg-[#0b2d6b] text-white px-4 py-2 rounded-md hover:bg-blue-800 font-semibold text-sm">Add</button>
            </form>
            <ul className="divide-y divide-gray-100">
              {types?.map(t => (
                <li key={t.id} className="py-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{t.name}</span>
                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="table" value="incident_types" />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Manage Stations */}
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-bold text-gray-800">Coast Guard Stations</h2>
          </div>
          <div className="p-4">
            <form action={addStation} className="flex gap-2 mb-4">
              <input type="text" name="name" placeholder="New Station Name..." required className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none text-sm" />
              <button type="submit" className="bg-[#0b2d6b] text-white px-4 py-2 rounded-md hover:bg-blue-800 font-semibold text-sm">Add</button>
            </form>
            <ul className="divide-y divide-gray-100">
              {stations?.map(s => (
                <li key={s.id} className="py-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="table" value="stations" />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}