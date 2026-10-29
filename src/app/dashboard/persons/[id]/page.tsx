import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false;

// Define types to fix the 'any' error
type JoinedIncident = {
  id: string;
  case_no: string;
  date_of_incident: string;
  status: string;
  incident_types: { name: string } | { name: string }[] | null;
};

type IncidentPersonLink = {
  incidents: JoinedIncident | JoinedIncident[] | null;
};

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // 1. Fetch the Person/Company Details
  const { data: person, error } = await supabase
    .from('persons_companies')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !person) return notFound()

  // 2. Fetch Linked Incidents (History)
  const { data: linkedIncidents } = await supabase
    .from('incident_persons')
    .select(`
      incidents (
        id,
        case_no,
        date_of_incident,
        status,
        incident_types (name)
      )
    `)
    .eq('person_id', person.id)

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header Area */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/persons" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
            ← Back to Directory
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{person.name}</h1>
          <p className="text-gray-500 font-medium">{person.type}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-bold rounded-full border ${
            person.status === 'Active Case' ? 'bg-red-100 text-red-800 border-red-200' : 
            person.status === 'History Only' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {person.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b pb-2">Contact Information</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-gray-500 font-medium mb-1">Contact Details</div>
                <div className="text-gray-900 font-semibold">{person.contact_info || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-1">Record Type</div>
                <div className="text-gray-900 font-semibold">{person.type === 'Person' ? 'Private Individual' : 'Company / Business'}</div>
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-1">Date Added</div>
                <div className="text-gray-900">
                  {new Date(person.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Remarks & Incident History */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Remarks Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Remarks / Background</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {person.remarks || 'No background information or remarks provided.'}
            </p>
          </div>

          {/* Incident History Card */}
          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Linked Case History</h3>
              <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                {linkedIncidents?.length || 0} Cases
              </span>
            </div>
            
            <div className="p-0">
              {linkedIncidents?.length === 0 ? (
                <p className="text-gray-500 text-sm italic p-6">This individual/company is not linked to any incidents yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {/* FIXED: Replaced 'any' with 'IncidentPersonLink' */}
                  {linkedIncidents?.map((link: IncidentPersonLink) => {
                    // Handle Supabase array return for joins
                    const inc = Array.isArray(link.incidents) ? link.incidents[0] : link.incidents;
                    if (!inc) return null;

                    // Handle Supabase array return for nested joins
                    const typeName = Array.isArray(inc.incident_types) 
                      ? inc.incident_types[0]?.name 
                      : inc.incident_types?.name;

                    return (
                      <li key={inc.id} className="hover:bg-blue-50 transition-colors">
                        <Link href={`/dashboard/incidents/${inc.id}`} className="block p-4 sm:px-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-bold text-blue-600 mb-1">{inc.case_no}</div>
                              <div className="text-sm text-gray-800 font-medium mb-1">
                                {typeName || 'Unknown Violation'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Date: {inc.date_of_incident}
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                              ${inc.status === 'Charged / Filed' ? 'bg-red-100 text-red-800' : 
                                inc.status === 'In Prosecution' ? 'bg-orange-100 text-orange-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {inc.status}
                            </span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}