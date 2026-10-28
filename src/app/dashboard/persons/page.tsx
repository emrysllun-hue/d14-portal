import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeletePersonButton from '@/components/DeletePersonButton'

export const dynamic = 'force-dynamic'

// Server Action to delete a person/company
async function deletePerson(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('persons_companies').delete().eq('id', id)
  revalidatePath('/dashboard/persons')
}

export default async function PersonsPage() {
  const supabase = await createClient()

  // 1. Fetch User Role for Admin check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 2. Fetch Persons/Companies
  const { data: persons } = await supabase
    .from('persons_companies')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Persons & Companies</h1>
          <p className="text-gray-500">Directory of individuals and businesses linked to cases.</p>
        </div>
        {isAdmin && (
          <Link 
            href="/dashboard/persons/new" 
            className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold whitespace-nowrap"
          >
            + Add Person/Company
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact Info</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Case Status</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {persons?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">No records found.</td>
                </tr>
              )}
              {persons?.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* 1. Name Column (Clickable) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 hover:underline">
                    <Link href={`/dashboard/persons/${p.id}`}>
                      {p.name}
                    </Link>
                  </td>

                  {/* 2. Type Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {p.type === 'Person' ? 'Private Individual' : 'Company / Business'}
                  </td>

                  {/* 3. Contact Info Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {p.contact_info || 'N/A'}
                  </td>

                  {/* 4. Case Status Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${p.status === 'Active Case' ? 'bg-red-100 text-red-800' : 
                        p.status === 'History Only' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center gap-3">
                        <Link 
                          href={`/dashboard/persons/${p.id}/edit`} 
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <form action={deletePerson}>
                          <input type="hidden" name="id" value={p.id} />
                          <DeletePersonButton />
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}