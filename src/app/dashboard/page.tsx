import { createClient } from '@/lib/supabase/server'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import StatCard from '@/components/dashboard/StatCard'
import MapWrapper from '@/components/dashboard/MapWrapper'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type DashboardIncident = {
  id: string;
  status: string;
  date_of_incident: string;
  case_no: string;
  location: string;
  persons_involved: number;
  incident_types: { name: string } | null;
};

const Icons = {
  Operations: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>,
  Cases: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
  Personnel: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  Linked: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>,
  Court: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>,
  Convictions: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

  let displayName = 'Authorized User'
  if (profile && profile.rank && profile.full_name) {
    const rank = profile.rank.toUpperCase();
    if (profile.personnel_type === 'Officer') {
      displayName = `${rank} ${profile.full_name.toUpperCase()} PCG`;
    } else {
      const titleCaseName = profile.full_name.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
      displayName = `${rank} ${titleCaseName} PCG`;
    }
  }

  // --- CALCULATE DATE RANGES FOR TRENDS ---
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  // --- FETCH ALL DATA IN PARALLEL ---
  const [
    { count: totalOps },
    { count: opsThisMonth },
    { count: opsLastMonth },
    { count: totalIncidents },
    { count: incidentsThisMonth },
    { count: incidentsLastMonth },
    { count: activePersonnel },          
    { count: activePersonsCompanies },   
    { count: courtThisMonth },
    { count: courtLastMonth },
    { count: dispositionsThisMonth },
    { count: dispositionsLastMonth },
    { data: allIncidents },
    { data: allOperations } // <-- ADD THIS
  ] = await Promise.all([
    // Operations
    supabase.from('operations').select('*', { count: 'exact', head: true }),
    supabase.from('operations').select('*', { count: 'exact', head: true }).gte('date', firstDayThisMonth).lte('date', lastDayThisMonth),
    supabase.from('operations').select('*', { count: 'exact', head: true }).gte('date', firstDayLastMonth).lte('date', lastDayLastMonth),
    
    // Incidents
    supabase.from('incidents').select('*', { count: 'exact', head: true }),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('date_of_incident', firstDayThisMonth).lte('date_of_incident', lastDayThisMonth),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).gte('date_of_incident', firstDayLastMonth).lte('date_of_incident', lastDayLastMonth),
    
    // Personnel (Only counts those with Status = 'Active')
    supabase.from('personnel').select('*', { count: 'exact', head: true }).eq('status', 'Active'),

    // Persons/Companies (Only counts those with Status = 'Active Case')
    supabase.from('persons_companies').select('*', { count: 'exact', head: true }).eq('status', 'Active Case'),

    // Court Proceedings
    supabase.from('court_proceedings').select('*', { count: 'exact', head: true }).gte('hearing_date', firstDayThisMonth).lte('hearing_date', lastDayThisMonth),
    supabase.from('court_proceedings').select('*', { count: 'exact', head: true }).gte('hearing_date', firstDayLastMonth).lte('hearing_date', lastDayLastMonth),

    // Convictions / Final Dispositions
    supabase.from('incidents').select('*', { count: 'exact', head: true }).in('status', ['Settled', 'Charged / Filed']).gte('date_of_incident', firstDayThisMonth).lte('date_of_incident', lastDayThisMonth),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).in('status', ['Settled', 'Charged / Filed']).gte('date_of_incident', firstDayLastMonth).lte('date_of_incident', lastDayLastMonth),

    // All Incidents (for Charts, Map)
    supabase.from('incidents').select('*, incident_types(name)'),
    supabase.from('operations').select('*')
  ]);

  // Helper function to calculate percentage
  const calculateTrend = (current: number | null, last: number | null) => {
    const cur = current || 0;
    const prev = last || 0;
    if (prev === 0 && cur > 0) return "100%"; 
    if (prev === 0 && cur === 0) return "0%";
    const diff = cur - prev;
    const percent = Math.round((diff / prev) * 100);
    return `${percent > 0 ? '+' : ''}${percent}%`;
  }

  const opsTrend = calculateTrend(opsThisMonth, opsLastMonth);
  const incidentsTrend = calculateTrend(incidentsThisMonth, incidentsLastMonth);
  const courtTrend = calculateTrend(courtThisMonth, courtLastMonth);
  const dispositionsTrend = calculateTrend(dispositionsThisMonth, dispositionsLastMonth);

  // Process Data for Charts
  const statusCounts = allIncidents?.reduce((acc: Record<string, number>, curr: DashboardIncident) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const totalCount = allIncidents?.length || 0;
  const statusData = Object.keys(statusCounts).map(key => {
    const value = statusCounts[key];
    const percentage = totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
    return { name: key, value: value, label: `${value} (${percentage}%)` };
  });

  const violationCounts = allIncidents?.reduce((acc: Record<string, number>, curr: DashboardIncident) => {
    const typeName = curr.incident_types?.name || 'Unknown';
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {}) || {};

  const violationData = Object.keys(violationCounts).map(key => ({ name: key, value: violationCounts[key] }));

  const { data: recentCases } = await supabase
    .from('incidents')
    .select('*, incident_types(name)')
    .order('date_of_incident', { ascending: false })
    .limit(5)

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Welcome, {displayName}</h1>
        <p className="text-sm md:text-base text-gray-500">Office of the Deputy Chief of District Staff for Maritime Security Law Enforcement (D14)</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        <StatCard title="Total Operations" value={totalOps || 0} trend={opsTrend} icon={Icons.Operations} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Total Incidents" value={totalIncidents || 0} trend={incidentsTrend} icon={Icons.Cases} iconBgColor="bg-red-50" iconColor="text-red-600" />
        
        {/* Updated to use active counts */}
        <StatCard title="Personnel Involved" value={activePersonnel || 0} trend="0%" icon={Icons.Personnel} iconBgColor="bg-green-50" iconColor="text-green-600" />
        <StatCard title="Persons/Companies Linked" value={activePersonsCompanies || 0} trend="0%" icon={Icons.Linked} iconBgColor="bg-yellow-50" iconColor="text-yellow-600" />
        
        <StatCard title="Court Proceedings" value={(courtThisMonth || 0) + (courtLastMonth || 0)} trend={courtTrend} icon={Icons.Court} iconBgColor="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Convictions / Final Disposition" value={(dispositionsThisMonth || 0) + (dispositionsLastMonth || 0)} trend={dispositionsTrend} icon={Icons.Convictions} iconBgColor="bg-teal-50" iconColor="text-teal-600" />
      </div>

      <DashboardCharts statusData={statusData} violationData={violationData} />

    <MapWrapper cases={allIncidents || []} operations={allOperations || []} />

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mb-8">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">Recent Incidents</h2>
          <Link href="/dashboard/incidents" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">View All Incidents →</Link>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Case No.</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCases?.map((c: DashboardIncident) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                    <Link href={`/dashboard/incidents/${c.id}`}>{c.case_no}</Link>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.date_of_incident}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.incident_types?.name}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[200px]">{c.location}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                      {c.status}
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