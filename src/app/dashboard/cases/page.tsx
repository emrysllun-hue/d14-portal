import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic' 

export default async function CasesPage() {
  const supabase = await createClient();

  const { data: cases } = await supabase.from('cases').select('*').order('date_of_incident', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Case Management</h1>
          <p className="text-gray-500">View and manage all maritime law enforcement cases.</p>
        </div>
        <Link href="/dashboard/cases/new" className="bg-[#0b2d6b] text-white px-4 py-2 rounded hover:bg-blue-800 transition">
          + Add New Case
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">{c.case_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.date_of_incident}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.type_of_violation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
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