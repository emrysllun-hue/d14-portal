import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function submitCase(formData: FormData) {
  'use server'
  const supabase = await createClient()
  
  const caseData = {
    case_no: formData.get('case_no') as string,
    date_of_incident: formData.get('date_of_incident') as string,
    type_of_violation: formData.get('type_of_violation') as string,
    location: formData.get('location') as string,
    status: formData.get('status') as string,
  }

  const { error } = await supabase.from('cases').insert(caseData)
  if (error) return redirect('/dashboard/cases/new?error=true')
  redirect('/dashboard/cases')
}

export default function NewCasePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/cases" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Cases
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Create New Case</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form action={submitCase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
            <input type="text" name="case_no" required placeholder="MSL-2025-XXXX" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident</label>
            <input type="date" name="date_of_incident" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Violation</label>
            <select name="type_of_violation" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="Illegal Fishing">Illegal Fishing</option>
              <option value="Smuggling">Smuggling</option>
              <option value="Marine Pollution">Marine Pollution</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="Initial Apprehension">Initial Apprehension</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="In Prosecution">In Prosecution</option>
              <option value="Charged / Filed">Charged / Filed</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[#0b2d6b] text-white font-bold py-3 rounded hover:bg-blue-800 transition mt-4">
            SAVE CASE RECORD
          </button>
        </form>
      </div>
    </div>
  )
}