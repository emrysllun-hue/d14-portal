import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import IncidentFilters from '@/components/incidents/IncidentFilters'
import { Suspense } from 'react'



type IncidentRecord = {
  id: string;
  case_no: string;
  date_of_incident: string;
  location: string;
  persons_involved: number;
  estimated_value: number;
  status: string;
  incident_types: { name: string } | null;
  stations: { name: string } | null;
};

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string, search?: string, status?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const typeFilter = params.type
  const searchFilter = params.search
  const statusFilter = params.status

  // --- NEW: Fetch user role to check for Admin access ---
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 1. Build the base query
  let query = supabase
    .from('incidents')
    .select(`
      *,
      incident_types (name),
      stations (name)
    `)
    .order('date_of_incident', { ascending: false })

  // 2. Apply Category Filter (from Sidebar)
  if (typeFilter) {
    const { data: typeData } = await supabase
      .from('incident_types')
      .select('id')
      .eq('name', typeFilter)
      .single()
      
    if (typeData) {
      query = query.eq('incident_type_id', typeData.id)
    }
  }

  // 3. Apply Search Filter (Case No. OR Location)
  if (searchFilter) {
    query = query.or(`case_no.ilike.%${searchFilter}%,location.ilike.%${searchFilter}%`)
  }

  // 4. Apply Status Filter
  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: incidents } = await query

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            {typeFilter ? `${typeFilter} Incidents` : 'All Maritime Incidents'}
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            {typeFilter 
              ? `Viewing all recorded ${typeFilter.toLowerCase()} operations.` 
              : 'View and manage all maritime law enforcement records.'}
          </p>
        </div>
        
        {/* FIXED: Only show this button if the user is an Admin */}
        {isAdmin && (
          <Link 
            href="/dashboard/incidents/new" 
            className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold whitespace-nowrap"
          >
            + Add New Incident
          </Link>
        )}
      </div>

      {/* Search and Filter Component */}
      <Suspense fallback={<div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg mb-6"></div>}>
        <IncidentFilters />
      </Suspense>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Case No.</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Station</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Persons</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Est. Value</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p>No incidents found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
              
              {incidents?.map((inc: IncidentRecord) => (
                <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600 hover:underline">
                    <Link href={`/dashboard/incidents/${inc.id}`}>
                      {inc.case_no}
                    </Link>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {inc.date_of_incident}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                    {inc.incident_types?.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {inc.stations?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-[250px] truncate" title={inc.location}>
                    {inc.location}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-700">
                    {inc.persons_involved}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                    ₱{Number(inc.estimated_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${inc.status === 'Charged / Filed' ? 'bg-red-100 text-red-800' : 
                        inc.status === 'In Prosecution' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}