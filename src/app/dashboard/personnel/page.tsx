import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'



async function deletePersonnel(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  
  await supabase.from('personnel').delete().eq('id', id)
  revalidatePath('/dashboard/personnel')
}

export default async function PersonnelPage() {
  const supabase = await createClient()

  const { data: personnel } = await supabase
    .from('personnel')
    .select('*')
    .order('last_name', { ascending: true })

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Personnel Directory</h1>
          <p className="text-gray-500">Manage officers and personnel assigned to the district.</p>
        </div>
        <Link 
          href="/dashboard/personnel/new" 
          className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold whitespace-nowrap"
        >
          + Add Personnel
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Unit / Station</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Case Assignment</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {personnel?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No personnel records found. Click &quot;+ Add Personnel&quot; to create one.
                  </td>
                </tr>
              )}
              {personnel?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{p.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.unit || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  
                  {/* UPDATED: Read from the new boolean column */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {p.has_recorded_case ? (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                        Has Recorded Case(s)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-500">
                        None
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div className="flex justify-center gap-3">
                      <Link 
                        href={`/dashboard/personnel/${p.id}/edit`} 
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={deletePersonnel}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-600 hover:text-red-800 font-semibold transition-colors">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}