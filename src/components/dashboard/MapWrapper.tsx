'use client';

import dynamic from 'next/dynamic';

const CaseMap = dynamic(() => import('./CaseMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] md:h-[450px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500 mb-8 border border-gray-200">
      Loading Operational Map...
    </div>
  )
});

// Define the type here to remove 'any'
type MapIncident = {
  id: string;
  case_no: string;
  location: string;
  status: string;
  date_of_incident: string;
  incident_types: { name: string } | null;
};

export default function MapWrapper({ cases }: { cases: MapIncident[] }) {
  return <CaseMap cases={cases} />;
}