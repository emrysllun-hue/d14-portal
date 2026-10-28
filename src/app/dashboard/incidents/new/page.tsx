import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function submitIncident(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  
  // 1. Handle Secure Image Upload (Private Bucket)
  const imageFile = formData.get('image') as File | null;
  let imagePath = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('incident-images')
      .upload(fileName, imageFile);

    if (!uploadError) {
      imagePath = fileName;
    } else {
      console.error("Upload error:", uploadError)
    }
  }

  // 2. Extract all other form data
  const incidentData = {
    case_no: formData.get('case_no') as string,
    incident_type_id: formData.get('incident_type_id') as string,
    station_id: formData.get('station_id') as string,
    date_of_incident: formData.get('date_of_incident') as string,
    time_of_incident: formData.get('time_of_incident') as string || null,
    location: formData.get('location') as string,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    vessel_details: formData.get('vessel_details') as string,
    persons_involved: Number(formData.get('persons_involved')) || 0,
    confiscated_items: formData.get('confiscated_items') as string,
    estimated_value: Number(formData.get('estimated_value')) || 0,
    gdrive_link: formData.get('gdrive_link') as string || null,
    image_url: imagePath,
    remarks: formData.get('remarks') as string,
    status: formData.get('status') as string,
  }

  // 3. Insert into database
  const { error } = await supabase.from('incidents').insert(incidentData)

  if (error) {
    console.error(error)
    return redirect('/dashboard/incidents/new?error=true')
  }

  redirect('/dashboard/incidents')
}

export default async function NewIncidentPage() {
  const supabase = await createClient()

  const { data: types } = await supabase.from('incident_types').select('*').order('name')
  const { data: stations } = await supabase.from('stations').select('*').order('name')

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/incidents" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
          ← Back to Incidents
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Record New Incident</h1>
        <p className="text-gray-500">Enter the details of the maritime law enforcement activity.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
        {/* The form action is now completely clean */}
        <form action={submitIncident} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Case Number *</label>
              <input type="text" name="case_no" required placeholder="e.g., MSL-2026-F01" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Incident *</label>
              <input type="date" name="date_of_incident" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Category *</label>
              <select name="incident_type_id" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="">Select a category...</option>
                {types?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Station Involved *</label>
              <select name="station_id" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="">Select a station...</option>
                {stations?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location Details *</label>
              <input type="text" name="location" required placeholder="e.g., Vicinity waters of Sablayan" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Time (Optional)</label>
              <input type="time" name="time_of_incident" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-md border border-blue-100">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Exact Latitude (Optional)</label>
              <input type="number" step="any" name="latitude" placeholder="e.g., 12.8394" className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Exact Longitude (Optional)</label>
              <input type="number" step="any" name="longitude" placeholder="e.g., 120.7711" className="w-full px-4 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <p className="text-xs text-blue-700 md:col-span-2">If provided, this pin will override the text location on the Operational Map.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vessel Details (MBCA / FBCA)</label>
            <input type="text" name="vessel_details" placeholder="e.g., FBCA MC Zane Roz Luis" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Persons Involved</label>
              <input type="number" name="persons_involved" min="0" defaultValue="0" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confiscated Items</label>
              <input type="text" name="confiscated_items" placeholder="e.g., Cigarettes" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Value (PHP)</label>
              <input type="number" name="estimated_value" step="0.01" min="0" defaultValue="0" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Case Status *</label>
              <select name="status" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none bg-white">
                <option value="Under Investigation">Under Investigation</option>
                <option value="In Prosecution">In Prosecution</option>
                <option value="Charged / Filed">Charged / Filed</option>
                <option value="Settled">Settled</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Google Drive Link (Full Report)</label>
              <input type="url" name="gdrive_link" placeholder="https://drive.google.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none" />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Incident Photo (Private)</label>
            <input type="file" name="image" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0b2d6b] file:text-white hover:file:bg-blue-800" />
            <p className="text-xs text-gray-400 mt-2">Only authorized D-14 personnel can view this image.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks / Narrative</label>
            <textarea name="remarks" rows={4} placeholder="Enter the full details of the operation..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0b2d6b] focus:outline-none"></textarea>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/dashboard/incidents" className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-md transition">Cancel</Link>
            <button type="submit" className="bg-[#0b2d6b] text-white font-bold px-8 py-2.5 rounded-md hover:bg-blue-800 transition shadow-md">SAVE RECORD</button>
          </div>
        </form>
      </div>
    </div>
  )
}