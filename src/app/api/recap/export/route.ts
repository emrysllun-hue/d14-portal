import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function for CSV
const getQuarter = (dateString: string) => {
  if (!dateString) return 0;
  const month = new Date(dateString).getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export async function GET() {
  const supabase = await createClient()

  const { data: incidents } = await supabase.from('incidents').select(`*, incident_types (name), stations (name)`)
  const { data: stations } = await supabase.from('stations').select('*').order('name')
  const { data: types } = await supabase.from('incident_types').select('*').order('name')

  const matrix: Record<string, Record<string, Record<number, number>>> = {}
  
  stations?.forEach(station => {
    matrix[station.name] = {}
    types?.forEach(type => {
      matrix[station.name][type.name] = { 1: 0, 2: 0, 3: 0, 4: 0 }
    })
  })

  incidents?.forEach(inc => {
    const stationName = inc.stations?.name
    const typeName = inc.incident_types?.name
    const date = inc.date_of_incident
    if (stationName && typeName && date && matrix[stationName]) {
      const q = getQuarter(date);
      if (q > 0) matrix[stationName][typeName][q] += 1
    }
  })

  // Build CSV
  const headerRow1 = ['STATION']
  const headerRow2 = ['']
  
  types?.forEach(t => {
    headerRow1.push(`${t.name.toUpperCase()}`, '', '', '', '')
    headerRow2.push('1st', '2nd', '3rd', '4th', '')
  })
  headerRow1.push('TOTAL')
  headerRow2.push('')
  
  const dataRows = stations?.map(station => {
    let rowTotal = 0;
    const row = [station.name]
    
    types?.forEach(t => {
      const q = matrix[station.name][t.name]
      row.push(q[1].toString(), q[2].toString(), q[3].toString(), q[4].toString(), '')
      rowTotal += q[1] + q[2] + q[3] + q[4]
    })
    row.push(rowTotal.toString())
    return row.join(',')
  }) || []

  // Footer Row 1 (Total per Quarter)
  const footerRow1 = ['Total (per Quarter)']
  types?.forEach(t => {
    const q1 = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][1], 0) || 0;
    const q2 = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][2], 0) || 0;
    const q3 = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][3], 0) || 0;
    const q4 = stations?.reduce((acc, s) => acc + matrix[s.name][t.name][4], 0) || 0;
    footerRow1.push(q1.toString(), q2.toString(), q3.toString(), q4.toString(), '')
  })
  footerRow1.push((incidents?.length || 0).toString())

  // Footer Row 2 (Total per Category)
  const footerRow2 = ['Total (per Category)']
  types?.forEach(t => {
    let catTotal = 0;
    stations?.forEach(s => {
      catTotal += Object.values(matrix[s.name][t.name]).reduce((a, b) => a + b, 0);
    });
    // Place total in the middle of the 4 quarters, leave others blank
    footerRow2.push(catTotal.toString(), '', '', '', '')
  })
  footerRow2.push('')

  const csvContent = [
    headerRow1.join(','), 
    headerRow2.join(','), 
    ...dataRows, 
    footerRow1.join(','), 
    footerRow2.join(',')
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="CGDSTL_Operations_Recap.csv"',
    },
  })
}