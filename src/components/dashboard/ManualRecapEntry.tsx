'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Define the type for the overrides data to replace 'any[]'
type OverrideData = {
  id: string;
  station_id: string;
  incident_type_id: string;
  quarter: number;
  count: number;
  stations: { name: string } | null;
  incident_types: { name: string } | null;
};

export default function ManualRecapEntry({
  stations,
  types,
  overrides,
}: {
  stations: { id: string; name: string }[];
  types: { id: string; name: string }[];
  overrides: OverrideData[]; // Fixed: Replaced any[] with OverrideData[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const station_id = formData.get('station_id') as string;
    const incident_type_id = formData.get('incident_type_id') as string;
    const quarter = parseInt(formData.get('quarter') as string);
    const count = parseInt(formData.get('count') as string);

    // Upsert logic: If a record exists, update it. Otherwise, insert.
    const { error } = await supabase
      .from('recap_overrides')
      .upsert(
        { station_id, incident_type_id, quarter, count },
        { onConflict: 'station_id, incident_type_id, quarter' }
      );

    setIsSaving(false);

    if (!error) {
      setIsOpen(false);
      router.refresh(); // Refresh to show new data
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manual entry?")) return;
    
    const { error } = await supabase.from('recap_overrides').delete().eq('id', id);
    if (!error) {
      router.refresh();
    } else {
      alert("Error deleting: " + error.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm font-semibold flex items-center gap-2 whitespace-nowrap"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Add Manual Entry
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 animate-fade-in flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Manage Historical Data</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              
              {/* Left Column: Form to add/update */}
              <div>
                <p className="text-xs text-gray-500 mb-4">Use this to add operations that are not recorded in the main Incident database.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Station</label>
                    <select name="station_id" required className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50">
                      <option value="">Select Station...</option>
                      {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                    <select name="incident_type_id" required className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50">
                      <option value="">Select Category...</option>
                      {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Quarter</label>
                      <select name="quarter" required className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50">
                        <option value="1">1st Quarter</option>
                        <option value="2">2nd Quarter</option>
                        <option value="3">3rd Quarter</option>
                        <option value="4">4th Quarter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Count</label>
                      <input type="number" name="count" min="0" required defaultValue="1" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="submit" disabled={isSaving} className="w-full px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
                      {isSaving ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Existing Overrides List */}
              <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Existing Manual Entries</h3>
                {overrides.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No manual entries recorded yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {overrides.map(ovr => (
                      <li key={ovr.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{ovr.stations?.name}</span>
                          <span className="text-gray-500">{ovr.incident_types?.name} - Q{ovr.quarter}: <strong className="text-purple-700">{ovr.count}</strong></span>
                        </div>
                        <button 
                          onClick={() => handleDelete(ovr.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}