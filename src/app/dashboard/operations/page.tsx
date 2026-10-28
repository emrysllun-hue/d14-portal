import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteOperationButton from '@/components/DeleteOperationButton'

export const dynamic = 'force-dynamic'

// Server Action to delete an operation
async function deleteOperation(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('operations').delete().eq('id', id)
  revalidatePath('/dashboard/operations')
}

export default async function OperationsPage() {
  const supabase = await createClient()

  // 1. Fetch User Role for Admin check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 2. Fetch Operations
  const { data: operations } = await supabase
    .from('operations')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Maritime Operations</h1>
          <p className="text-gray-500">Manage law enforcement operations and patrols.</p>
        </div>
        {isAdmin && (
          <Link 
            href="/dashboard/operations/new" 
            className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold whitespace-nowrap"
          >
            + Add New Operation
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Operation Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Personnel</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    No operations recorded yet.
                  </td>
                </tr>
              )}
              {operations?.map((op) => (
                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 hover:underline">
                    <Link href={`/dashboard/operations/${op.id}`}>
                      {op.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{op.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{op.location || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-700">{op.personnel_involved || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${op.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {op.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center gap-3">
                        <Link 
                          href={`/dashboard/operations/${op.id}/edit`} 
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <form action={deleteOperation}>
                          <input type="hidden" name="id" value={op.id} />
                          <DeleteOperationButton />
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