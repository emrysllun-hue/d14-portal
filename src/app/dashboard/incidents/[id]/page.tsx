import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'



// Define the types to fix the 'any' error
type PersonCompany = {
  id: string;
  name: string;
  type: string;
  status: string;
};

type IncidentPersonLink = {
  persons_companies: PersonCompany | PersonCompany[] | null;
};

// Server Action to Add a Court Proceeding
async function addProceeding(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const incident_id = formData.get('incident_id') as string
  
  const proceedingData = {
    incident_id,
    hearing_date: formData.get('hearing_date') as string,
    court_branch: formData.get('court_branch') as string,
    proceeding_type: formData.get('proceeding_type') as string,
    status: formData.get('status') as string,
    remarks: formData.get('remarks') as string,
  }

  await supabase.from('court_proceedings').insert(proceedingData)
  revalidatePath(`/dashboard/incidents/${incident_id}`)
}

// Server Action to Delete the Incident
async function deleteIncident(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { data: incident } = await supabase.from('incidents').select('image_url').eq('id', id).single()
  if (incident?.image_url) {
    await supabase.storage.from('incident-images').remove([incident.image_url])
  }

  await supabase.from('incidents').delete().eq('id', id)
  revalidatePath('/dashboard/incidents')
  redirect('/dashboard/incidents')
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // --- OPTIMIZED FETCHING ---
  // 1. Fetch User and Incident at the same time (No dependencies)
  const [
    { data: { user } },
    { data: incident, error }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('incidents')
      .select(`*, incident_types (name), stations (name), operations (name)`)
      .eq('id', resolvedParams.id)
      .single()
  ])

  if (error || !incident) return notFound()

  // 2. Fetch all dependent data in parallel
  const [
    { data: profile },
    { data: proceedings },
    { data: updaterData },
    { data: urlData },
    { data: linkedPersons }
  ] = await Promise.all([
    // Fetch role for admin buttons
    supabase.from('profiles').select('role').eq('id', user?.id).single(),
    
    // Fetch court proceedings
    supabase
      .from('court_proceedings')
      .select('*')
      .eq('incident_id', incident.id)
      .order('hearing_date', { ascending: true }),
    
    // Fetch updater info (only if it exists)
    incident.updated_by 
      ? supabase.from('profiles').select('rank, full_name, personnel_type').eq('id', incident.updated_by).single()
      : Promise.resolve({ data: null }),

    // Generate image URL (only if it exists)
    incident.image_url
      ? supabase.storage.from('incident-images').createSignedUrl(incident.image_url, 3600)
      : Promise.resolve({ data: null }),

    // Fetch linked persons
    supabase
      .from('incident_persons')
      .select('persons_companies (id, name, type, status)')
      .eq('incident_id', incident.id)
  ]);

  const isAdmin = profile?.role === 'admin'
  const signedImageUrl = urlData?.signedUrl || null

  // Format the updater name based on PCG rules
  let updaterName = 'Unknown User';
  if (updaterData) {
    const rank = updaterData.rank ? updaterData.rank.toUpperCase() : '';
    const name = updaterData.full_name || 'User';
    if (updaterData.personnel_type === 'Officer') {
      updaterName = `${rank} ${name.toUpperCase()}`;
    } else {
      updaterName = `${rank} ${name.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase())}`;
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header Area */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/incidents" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
            ← Back to Incidents List
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{incident.case_no}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {incident.status}
          </span>

          {isAdmin && (
            <div className="flex gap-2 ml-4">
              <Link href={`/dashboard/incidents/${incident.id}/edit`} className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition text-sm font-semibold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Edit
              </Link>
              <form action={deleteIncident}>
                <input type="hidden" name="id" value={incident.id} />
                <button type="submit" className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition text-sm font-semibold shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Image & Links */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Incident Photo</h3>
            {signedImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signedImageUrl} alt="Incident" className="w-full h-auto rounded-md object-cover border border-gray-200" />
            ) : (
              <div className="w-full h-48 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-sm">No photo attached</div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Full Report</h3>
            {incident.gdrive_link ? (
              <a href={incident.gdrive_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#0b2d6b] text-white py-2 rounded hover:bg-blue-800 transition">
                Open Google Drive
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic text-center">No reference link provided</p>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Incident Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 text-sm">
            <div className="text-gray-500 font-medium">Category:</div>
            <div className="text-gray-900 font-semibold">{incident.incident_types?.name}</div>
            
            <div className="text-gray-500 font-medium">Station:</div>
            <div className="text-gray-900 font-semibold">{incident.stations?.name}</div>
            
            <div className="text-gray-500 font-medium">Linked Operation:</div>
            <div className="text-gray-900 font-semibold">
              {incident.operations?.name ? (
                <Link href={`/dashboard/operations/${incident.operation_id}`} className="text-blue-600 hover:underline">
                  {incident.operations.name}
                </Link>
              ) : (
                <span className="text-gray-400 italic">None</span>
              )}
            </div>

            <div className="text-gray-500 font-medium">Date & Time:</div>
            <div className="text-gray-900">{incident.date_of_incident} {incident.time_of_incident ? `at ${incident.time_of_incident}` : ''}</div>
            
            <div className="text-gray-500 font-medium">Location:</div>
            <div className="text-gray-900">{incident.location}</div>
            
            <div className="text-gray-500 font-medium">Vessel Details:</div>
            <div className="text-gray-900">{incident.vessel_details || 'N/A'}</div>
            
            <div className="text-gray-500 font-medium">Total Persons Involved:</div>
            <div className="text-gray-900">{incident.persons_involved}</div>

            {/* NEW: Linked Individuals Display (Fixed Types) */}
            <div className="text-gray-500 font-medium">Linked Individuals:</div>
            <div className="text-gray-900 font-semibold flex flex-col gap-1">
              {linkedPersons && linkedPersons.length > 0 ? (
                // FIXED: Replaced 'any' with 'IncidentPersonLink'
                linkedPersons.map((lp: IncidentPersonLink) => {
                  // Supabase returns this as an array sometimes, so we extract the first item
                  const person = Array.isArray(lp.persons_companies) ? lp.persons_companies[0] : lp.persons_companies;
                  
                  if (!person) return null;
                  
                  return (
                    <Link href={`/dashboard/persons`} key={person.id} className="text-blue-600 hover:underline">
                      {person.name} ({person.type})
                    </Link>
                  );
                })
              ) : (
                <span className="text-gray-400 italic font-normal">No specific individuals linked</span>
              )}
            </div>

            <div className="text-gray-500 font-medium">Confiscated Items:</div>
            <div className="text-gray-900">{incident.confiscated_items || 'N/A'}</div>
            
            <div className="text-gray-500 font-medium">Estimated Value:</div>
            <div className="font-bold text-green-700">₱{Number(incident.estimated_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mt-8 mb-4">Remarks / Narrative</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{incident.remarks || 'No remarks provided.'}</p>
          
          {/* AUDIT TRAIL FOOTER */}
          {incident.updated_at && (
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-400 italic">
              <span>
                Last updated by: <strong className="text-gray-600">{updaterName}</strong>
              </span>
              <span>
                {new Date(incident.updated_at).toLocaleString('en-PH', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          )}

        </div>

      </div>

      {/* Court Proceedings Section */}
      <div className="mt-8 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Court Proceedings & Disposition</h2>
        </div>
        
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            {proceedings?.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No court proceedings recorded yet.</p>
            ) : (
              proceedings?.map((proc) => (
                <div key={proc.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{proc.proceeding_type}</span>
                      <span className="text-sm text-gray-600 ml-2">({proc.hearing_date})</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${proc.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {proc.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700"><strong>Court:</strong> {proc.court_branch}</p>
                  {proc.remarks && <p className="text-sm text-gray-600 mt-1 italic">&quot;{proc.remarks}&quot;</p>}
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">Log New Proceeding</h3>
            <form action={addProceeding} className="space-y-3">
              <input type="hidden" name="incident_id" value={incident.id} />
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hearing Date</label>
                <input type="date" name="hearing_date" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Court Branch</label>
                <input type="text" name="court_branch" required placeholder="e.g., MTC Batangas City" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Proceeding Type</label>
                <select name="proceeding_type" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option value="Arraignment">Arraignment</option>
                  <option value="Pre-Trial">Pre-Trial</option>
                  <option value="Trial">Trial</option>
                  <option value="Promulgation">Promulgation</option>
                  <option value="Motion Hearing">Motion Hearing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select name="status" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Postponed">Postponed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea name="remarks" rows={2} placeholder="Notes..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
              </div>

              <button type="submit" className="w-full bg-[#0b2d6b] text-white font-bold py-2 rounded text-sm hover:bg-blue-800 transition">
                ADD PROCEEDING
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  )
}