'use client';

import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LabelList 
} from 'recharts';

// Map exact category names to the colors used in the CaseMap
const CATEGORY_COLORS: Record<string, string> = {
  'Fishing': '#0EA5E9',   // Sky Blue
  'Smuggling': '#EF4444', // Red
  'Drugs': '#8B5CF6',     // Purple
  'Logging': '#10B981',   // Green
  'Piracy': '#F59E0B',    // Amber/Orange
};

const DEFAULT_COLOR = '#9CA3AF'; // Gray for any new categories added later

// Define the proper types to replace 'any'
type ChartData = {
  name: string;
  value: number;
  label?: string;
};

export default function DashboardCharts({ 
  statusData, 
  violationData 
}: { 
  statusData: ChartData[], 
  violationData: ChartData[] 
}) {
  const totalViolations = violationData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 w-full">
      
      {/* Case Status Overview (Bar Chart) */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100 flex flex-col w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Case Status Overview</h2>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{fontSize: 11, fill: '#4B5563', fontWeight: 600}} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
                background={{ fill: '#F3F4F6' }}
              >
                <LabelList dataKey="label" position="right" fill="#374151" fontSize={11} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cases by Violation Type (Donut Chart) */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100 flex flex-col w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Cases by Violation Type</h2>
        
        <div className="relative flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={violationData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {/* Apply the exact color based on the category name */}
                {violationData.map((entry: ChartData, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR} 
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-extrabold text-gray-800">{totalViolations}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Cases</span>
          </div>
        </div>
      </div>

    </div>
  );
}