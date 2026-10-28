import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend: string;
  trendLabel?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600'
}: StatCardProps) {
  const isPositive = !trend.startsWith('-');
  
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      
      {/* Header: Title and Icon */}
      <div className="flex justify-between items-start mb-2 sm:mb-4 gap-1">
        <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">
          {title}
        </h3>
        {icon && (
          <div className={`p-1 sm:p-2 rounded-lg flex-shrink-0 ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Body: Number and Trend */}
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-3">{value}</p>
        
        <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs">
          <span className={`flex items-center font-bold px-1 sm:px-1.5 py-0.5 rounded ${isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {isPositive ? '↑' : '↓'} {trend.replace('-', '')}
          </span>
          <span className="text-gray-400 font-medium hidden sm:inline">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}