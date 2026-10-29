import { createClient } from '@/lib/supabase/server'
import { Fragment } from 'react'
import ManualRecapEntry from '@/components/dashboard/ManualRecapEntry'

export const instant = false;

const getQuarter = (dateString: string) => {
  if (!dateString) return 0;
  const month = new Date(dateString).getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export default async function RecapPage() {
  const supabase = await createClient()

  // 1. Check User Role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isAdmin = profile?.role === 'admin'

  // 2. Fetch Data
  const { data: incidents } = await supabase.from('incidents').select(`*, incident_types (name), stations (name)`)
  const { data: overrides } = await supabase.from('recap_overrides').select(`*, incident_types (name), stations (name)`)
  const { data: stations } = await supabase.from('stations').select('*').order('name')
  const { data: types } = await supabase.from('incident_types').select('*').order('name')

  // 3. Build Matrix
  const matrix: Record<string, Record<string, Record<number, number>>> = {}
  
  stations?.forEach(station => {
    matrix[station.name] = {}
    types?.forEach(type => {
      matrix[station.name][type.name] = { 1: 0, 2: 0, 3: 0, 4: 0 }
    })
  })

  // Populate with Real Incidents
  incidents?.forEach(inc => {
    const stationName = inc.stations?.name
    const typeName = inc.incident_types?.name
    const date = inc.date_of_incident
    
    if (stationName && typeName && date && matrix[stationName]) {
      const q = getQuarter(date);
      if (q > 0) {
        matrix[stationName][typeName][q] += 1
      }
    }
  })

  // Populate with Manual Overrides
  overrides?.forEach(ovr => {
    const stationName = ovr.stations?.name
    const typeName = ovr.incident_types?.name
    const q = ovr.quarter

    if (stationName && typeName && q && matrix[stationName]) {
      matrix[stationName][typeName][q] += ovr.count;
    }
  })

  // Calculate Grand Total (Incidents + Overrides)
  const grandTotal = Object.values(matrix).reduce((acc, stationData) => {
    return acc + Object.values(stationData).reduce((sum, qData) => sum + Object.values(qData).reduce((a, b) => a + b, 0), 0)
  }, 0)

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Operations Recap</h1>
          <p className="text-sm md:text-base text-gray-500">Quarterly Summary of Maritime Law Enforcement Activities by Station and Category.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Render Manual Entry Button if Admin */}
          {isAdmin && (
          <ManualRecapEntry stations={stations || []} types={types || []} overrides={overrides || []} />
          )}
          
          <a 
            href="/api/recap/export" 
            download
            className="bg-[#0b2d6b] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export to Excel (CSV)
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mb-8">
        <div className="overflow-x-auto w-full">
          <table className="min-w-max w-full divide-y divide-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-r border-b sticky left-0 bg-gray-100 z-10">
                  Station
                </th>
                {types?.map(t => (
                  <th key={t.id} colSpan={4} className="px-2 py-3 text-center text-[11px] font-bold text-gray-700 uppercase border-r border-b whitespace-nowrap">
                    {t.name}
                  </th>
                ))}
                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase bg-gray-200 border-b">
                  Total
                </th>
              </tr>
              <tr className="bg-gray-50">
                {types?.map(t => (
                  <Fragment key={t.id}>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-b w-10">1st</th>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-b w-10">2nd</th>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-b w-10">3rd</th>
                    <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-b w-10">4th</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {stations?.map(station => {
                let rowTotal = 0;
                Object.values(matrix[station.name]).forEach(qObj => {
                  rowTotal += Object.values(qObj).reduce((a, b) => a + b, 0);
                });

                return (
                  <tr key={station.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2 text-sm font-bold text-gray-800 border-r bg-gray-50 sticky left-0 z-10 whitespace-nowrap">
                      {station.name}
                    </td>
                    {types?.map(t => {
                      const qCounts = matrix[station.name][t.name];
                      return (
                        <Fragment key={t.id}>
                          <td className="px-2 py-2 text-center text-xs text-gray-600 border-r">{qCounts[1] > 0 ? qCounts[1] : '-'}</td>
                          <td className="px-2 py-2 text-center text-xs text-gray-600 border-r">{qCounts[2] > 0 ? qCounts[2] : '-'}</td>
                          <td className="px-2 py-2 text-center text-xs text-gray-600 border-r">{qCounts[3] > 0 ? qCounts[3] : '-'}</td>
                          <td className="px-2 py-2 text-center text-xs text-gray-600 border-r">{qCounts[4] > 0 ? qCounts[4] : '-'}</td>
                        </Fragment>
                      );
                    })}
                    <td className="px-4 py-2 text-center text-sm font-bold text-[#0a192f] bg-gray-50">{rowTotal}</td>
                  </tr>
                )
              })}
            </tbody>

            <tfoot className="bg-gray-100 font-bold">
              <tr className="border-t-2 border-gray-300">
                <td className="px-4 py-2 text-xs text-gray-800 border-r sticky left-0 bg-gray-100 z-10 whitespace-nowrap">Total (per Quarter)</td>
                {types?.map(t => {
                  const q1Total = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][1], 0) || 0;
                  const q2Total = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][2], 0) || 0;
                  const q3Total = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][3], 0) || 0;
                  const q4Total = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][4], 0) || 0;
                  return (
                    <Fragment key={t.id}>
                      <td className="px-2 py-2 text-center text-xs text-gray-800 border-r bg-gray-200">{q1Total}</td>
                      <td className="px-2 py-2 text-center text-xs text-gray-800 border-r bg-gray-200">{q2Total}</td>
                      <td className="px-2 py-2 text-center text-xs text-gray-800 border-r bg-gray-200">{q3Total}</td>
                      <td className="px-2 py-2 text-center text-xs text-gray-800 border-r bg-gray-200">{q4Total}</td>
                    </Fragment>
                  )
                })}
                {/* Render Grand Total here */}
                <td className="px-4 py-2 text-center font-bold text-[#0b2d6b] text-lg">{grandTotal}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-xs text-gray-600 border-r sticky left-0 bg-gray-50 z-10 whitespace-nowrap">Total (per Category)</td>
                {types?.map(t => {
                  let catTotal = 0;
                  stations?.forEach(s => {
                    catTotal += Object.values(matrix[s.name][t.name]).reduce((a, b) => a + b, 0);
                  });
                  return (
                    <td key={`cat-total-${t.id}`} colSpan={4} className="px-2 py-2 text-center text-sm text-gray-800 border-r bg-white">
                      {catTotal}
                    </td>
                  )
                })}
                <td className="px-4 py-2 border-l border-gray-200"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}