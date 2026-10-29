'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons missing in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LOCATION_COORDS: Record<string, [number, number]> = {
  'Vicinity waters of Sablayan, Occidental Mindoro': [12.8394, 120.7711],
  'Vicinity waters of Mamburao, Occidental Mindoro': [13.2233, 120.5961],
  'Vicinity waters off Gasan, Marinduque': [13.3500, 121.8500],
  'Vicinity waters off Brgy. Cambalo, Cajidiocan, Romblon': [12.3667, 122.6833],
  'Port of Real, Brgy. Ungos, Real, Quezon': [14.6667, 121.6000],
  'Sitio Agbalite, Brgy Harrison, Paluan, Occidental Mindoro': [13.4167, 120.4667],
  'Vicinity waters off Brgy. España, San Fernando, Romblon': [12.3000, 122.6000],
  'Vicinity Waters off MV Super Shuttle RORO 9, anchored off Brgy. Aplaya, Bauan, Batangas': [13.7500, 121.0500],
  'Brgy. Mabini, Corcuera, Romblon': [12.4333, 122.7167],
  'Batangas City': [13.7565, 121.0583],
  'Default': [12.8797, 121.7740] 
};

const getIncidentIcon = (typeName: string) => {
  let color = '#3B82F6';
  let iconHtml = '📍';

  if (typeName === 'Fishing') {
    color = '#0EA5E9';
    iconHtml = '🐟';
  } else if (typeName === 'Smuggling') {
    color = '#EF4444';
    iconHtml = '📦';
  } else if (typeName === 'Drugs') {
    color = '#8B5CF6';
    iconHtml = '💊';
  } else if (typeName === 'Logging') {
    color = '#10B981';
    iconHtml = '🪵';
  } else if (typeName === 'Piracy') {
    color = '#F59E0B';
    iconHtml = '🏴‍☠️';
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">${iconHtml}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getOperationIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #64748B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">🚢</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

type MapIncident = {
  id: string;
  case_no: string;
  location: string;
  status: string;
  date_of_incident: string;
  latitude: number | null;
  longitude: number | null;
  incident_types: { name: string } | null;
};

type MapOperation = {
  id: string;
  name: string;
  location: string | null;
  status: string;
  date: string;
  latitude: number | null;
  longitude: number | null;
};

export default function CaseMap({ cases, operations }: { cases: MapIncident[], operations: MapOperation[] }) {
  const center: [number, number] = [12.8797, 121.7740];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-bold text-gray-800">Operational Map</h2>
        <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-sky-500">🐟 Fishing</span>
          <span className="flex items-center gap-1 text-red-500">📦 Smuggling</span>
          <span className="flex items-center gap-1 text-purple-500">💊 Drugs</span>
          <span className="flex items-center gap-1 text-green-500">🪵 Logging</span>
          <span className="flex items-center gap-1 text-amber-500">🏴‍☠️ Piracy</span>
          <span className="flex items-center gap-1 text-slate-500 ml-4 border-l pl-4 border-gray-300">🚢 Operations</span>
        </div>
      </div>
    <div className="h-[300px] md:h-[450px] w-full z-0 relative">
        {/* Added a unique key prop to prevent reuse errors */}
        <MapContainer key="main-map" center={center} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render Incidents */}
          {cases.map((c) => {
            const typeName = c.incident_types?.name || 'Unknown';
            const coords = (c.latitude && c.longitude) ? [c.latitude, c.longitude] as [number, number] : LOCATION_COORDS[c.location] || LOCATION_COORDS['Default']; 
            
            return (
              <Marker key={`inc-${c.id}`} position={coords} icon={getIncidentIcon(typeName)}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{c.case_no}</h3>
                    <p className="text-xs text-gray-600 mb-1"><strong>Type:</strong> {typeName}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>Location:</strong> {c.location}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>Date:</strong> {c.date_of_incident}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      {c.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Operations */}
          {operations.map((op) => {
            if (!op.latitude || !op.longitude) return null; // Only show operations with coordinates
            
            return (
              <Marker key={`op-${op.id}`} position={[op.latitude, op.longitude]} icon={getOperationIcon()}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{op.name}</h3>
                    <p className="text-xs text-gray-600 mb-1"><strong>Location:</strong> {op.location || 'N/A'}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>Date:</strong> {op.date}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded-full">
                      {op.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>
    </div>
  );
}