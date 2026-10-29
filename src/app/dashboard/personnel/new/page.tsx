import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false;

async function addPersonnel(formData: FormData) {
  'use server'
  const supabase = await createClient()

  // Extract form data, converting the string 'true'/'false' to a boolean
  const personnelData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    rank: formData.get('rank') as string,
    unit: formData.get('unit') as string,
    status: formData.get('status') as string,
    has_recorded_case: formData.get('has_recorded_case') === 'true',
  }

  const { error } = await supabase.from('personnel').insert(personnelData)

  if (error) {
    console.error(error)
    return redirect('/dashboard/personnel/new?error=true')
  }

  redirect('/dashboard/personnel')
}

export default function NewPersonnelPage() {
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/personnel" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
          ← Back to Personnel Directory
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Personnel</h1>
        <p className="text-gray-500">Enter the details of the PCG officer or personnel.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        <form action={addPersonnel} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
              <input type="text" name="first_name" required placeholder="e.g., Juan" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
              <input type="text" name="last_name" required placeholder="e.g., Dela Cruz" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rank *</label>
              <select name="rank" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="">Select Rank...</option>
                {/* Officers */}
                <option value="ADM">ADM (Admiral)</option>
                <option value="VADM">VADM (Vice Admiral)</option>
                <option value="RADM">RADM (Rear Admiral)</option>
                <option value="COMMO">COMMO (Commodore)</option>
                <option value="CAPT">CAPT (Captain)</option>
                <option value="CDR">CDR (Commander)</option>
                <option value="LCDR">LCDR (Lieutenant Commander)</option>
                <option value="LT">LT (Lieutenant)</option>
                <option value="LTJG">LTJG (Lieutenant Junior Grade)</option>
                <option value="ENS">ENS (Ensign)</option>
                {/* Enlisted */}
                <option value="FMCPO">FMCPO (First Master Chief Petty Officer)</option>
                <option value="MCPO">MCPO (Master Chief Petty Officer)</option>
                <option value="SCPO">SCPO (Senior Chief Petty Officer)</option>
                <option value="CPO">CPO (Chief Petty Officer)</option>
                <option value="PO1">PO1 (Petty Officer 1st Class)</option>
                <option value="PO2">PO2 (Petty Officer 2nd Class)</option>
                <option value="PO3">PO3 (Petty Officer 3rd Class)</option>
                <option value="SN1">SN1 (Seaman 1st Class)</option>
                <option value="SN2">SN2 (Seaman 2nd Class)</option>
                <option value="ASN">ASN (Apprentice Seaman)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unit / Station</label>
              <input type="text" name="unit" placeholder="e.g., CGS BATANGAS" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status *</label>
              <select name="status" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* NEW DROPDOWN FOR CASE ASSIGNMENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Case Assignment</label>
              <select name="has_recorded_case" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="false">None</option>
                <option value="true">Has Recorded Case(s)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/dashboard/personnel" className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-md transition">Cancel</Link>
            <button type="submit" className="bg-[#0b2d6b] text-white font-bold px-8 py-2.5 rounded-md hover:bg-blue-800 transition shadow-md">SAVE PERSONNEL</button>
          </div>
        </form>
      </div>
    </div>
  )
}