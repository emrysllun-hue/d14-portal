import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import DeleteOperationButton from '@/components/DeleteOperationButton'



// Server Action to Delete the Operation
async function deleteOperation(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('operations').delete().eq('id', id)
  revalidatePath('/dashboard/operations')
  redirect('/dashboard/operations')
}

export default async function OperationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // 1. Fetch User Role for Admin check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 2. Fetch Operation
  const { data: operation, error } = await supabase
    .from('operations')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !operation) return notFound()

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Header Area */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/operations" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
            ← Back to Operations
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{operation.name}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-bold rounded-full border ${
            operation.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' : 
            operation.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {operation.status}
          </span>

          {isAdmin && (
            <div className="flex gap-2 ml-4">
              <Link href={`/dashboard/operations/${operation.id}/edit`} className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition text-sm font-semibold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Edit
              </Link>
              <form action={deleteOperation}>
                <input type="hidden" name="id" value={operation.id} />
                <DeleteOperationButton />
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6">Operation Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div>
            <div className="text-gray-500 font-medium mb-1">Date of Operation</div>
            <div className="text-gray-900 font-semibold text-base">{operation.date}</div>
          </div>

          <div>
            <div className="text-gray-500 font-medium mb-1">Personnel Involved</div>
            <div className="text-gray-900 font-semibold text-base">{operation.personnel_involved || 0} Personnel</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-gray-500 font-medium mb-1">Location Details</div>
            <div className="text-gray-900">{operation.location || 'No specific location description provided.'}</div>
          </div>

          {/* Display Coordinates if they exist */}
          {(operation.latitude || operation.longitude) && (
            <div className="sm:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-blue-900 font-bold mb-2">Exact Coordinates</div>
              <div className="flex gap-6 text-blue-800">
                <span><strong className="font-semibold text-blue-600">Latitude:</strong> {operation.latitude || 'N/A'}</span>
                <span><strong className="font-semibold text-blue-600">Longitude:</strong> {operation.longitude || 'N/A'}</span>
              </div>
            </div>
          )}

          <div className="sm:col-span-2 border-t pt-6 mt-2">
            <div className="text-gray-500 font-medium mb-2">Remarks / Narrative</div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
              {operation.remarks || 'No remarks or narrative provided for this operation.'}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}