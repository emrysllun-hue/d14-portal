import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function updatePerson(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  
  const personData = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    contact_info: formData.get('contact_info') as string,
    status: formData.get('status') as string,
    remarks: formData.get('remarks') as string,
  }

  const { error } = await supabase.from('persons_companies').update(personData).eq('id', id)

  if (error) {
    console.error("Failed to update:", error)
    return redirect(`/dashboard/persons/${id}/edit?error=true`)
  }

  redirect('/dashboard/persons')
}

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: person } = await supabase.from('persons_companies').select('*').eq('id', resolvedParams.id).single()
  
  if (!person) return notFound()

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/persons" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">← Back to Directory</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit Person / Company</h1>
        <p className="text-gray-500">Update the details for {person.name}.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        <form action={updatePerson} className="space-y-6">
          
          <input type="hidden" name="id" value={person.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name / Company Name *</label>
              <input type="text" name="name" required defaultValue={person.name} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
              <select name="type" required defaultValue={person.type} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b] bg-white">
                <option value="Person">Private Individual</option>
                <option value="Company">Company / Business</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Info</label>
              <input type="text" name="contact_info" defaultValue={person.contact_info || ''} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Case Status *</label>
              <select name="status" required defaultValue={person.status} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b] bg-white">
                <option value="No Active Case">None (No active case)</option>
                <option value="Active Case">Has Active Case</option>
                <option value="History Only">History Only (Past cases)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks / History Summary</label>
            <textarea name="remarks" rows={3} defaultValue={person.remarks || ''} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]"></textarea>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href="/dashboard/persons" className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-md">Cancel</Link>
            <button type="submit" className="bg-[#0b2d6b] text-white font-bold px-8 py-2.5 rounded-md hover:bg-blue-800">UPDATE RECORD</button>
          </div>
        </form>
      </div>
    </div>
  )
}