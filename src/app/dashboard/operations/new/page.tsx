import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false;

async function addOperation(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const opData = {
    name: formData.get('name') as string,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    status: formData.get('status') as string,
    personnel_involved: Number(formData.get('personnel_involved')) || 0,
    remarks: formData.get('remarks') as string,
  }

  const { error } = await supabase.from('operations').insert(opData)

  if (error) {
    console.error("Failed to save operation:", error)
    return redirect('/dashboard/operations/new?error=true')
  }

  redirect('/dashboard/operations')
}

export default function NewOperationPage() {
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/operations" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">← Back to Operations</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Record New Operation</h1>
        <p className="text-gray-500">Enter the details of the maritime operation.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        <form action={addOperation} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Operation Name *</label>
            <input type="text" name="name" required placeholder="e.g., OPERATION LIGTAS DAGAT" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
              <input type="date" name="date" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status *</label>
              <select name="status" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b] bg-white">
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Aborted">Aborted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location Description</label>
              <input type="text" name="location" placeholder="e.g., Vicinity waters of Batangas" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Personnel Involved</label>
              <input type="number" name="personnel_involved" min="0" defaultValue="0" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
          </div>

          {/* NEW: Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-md border border-blue-100">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Exact Latitude (Optional)</label>
              <input type="number" step="any" name="latitude" placeholder="e.g., 12.8394" className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Exact Longitude (Optional)</label>
              <input type="number" step="any" name="longitude" placeholder="e.g., 120.7711" className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea name="remarks" rows={3} placeholder="Operation details..." className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]"></textarea>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href="/dashboard/operations" className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-md">Cancel</Link>
            <button type="submit" className="bg-[#0b2d6b] text-white font-bold px-8 py-2.5 rounded-md hover:bg-blue-800">SAVE OPERATION</button>
          </div>
        </form>
      </div>
    </div>
  )
}