import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false;

async function addPerson(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const personData = {
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    contact_info: formData.get('contact_info') as string,
    status: formData.get('status') as string,
    remarks: formData.get('remarks') as string,
  }

  await supabase.from('persons_companies').insert(personData)
  redirect('/dashboard/persons')
}

export default function NewPersonPage() {
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/persons" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">← Back to Directory</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add Person / Company</h1>
        <p className="text-gray-500">Enter the details of the individual or business.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        <form action={addPerson} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name / Company Name *</label>
              <input type="text" name="name" required placeholder="e.g., Juan Dela Cruz or ABC Shipping Corp" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
              <select name="type" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b] bg-white">
                <option value="Person">Private Individual</option>
                <option value="Company">Company / Business</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Info</label>
              <input type="text" name="contact_info" placeholder="Phone number or Address" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Case Status *</label>
              <select name="status" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b] bg-white">
                <option value="No Active Case">None (No active case)</option>
                <option value="Active Case">Has Active Case</option>
                <option value="History Only">History Only (Past cases)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks / History Summary</label>
            <textarea name="remarks" rows={3} placeholder="Details of their involvement..." className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#0b2d6b]"></textarea>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href="/dashboard/persons" className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-md">Cancel</Link>
            <button type="submit" className="bg-[#0b2d6b] text-white font-bold px-8 py-2.5 rounded-md hover:bg-blue-800">SAVE RECORD</button>
          </div>
        </form>
      </div>
    </div>
  )
}