'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function IncidentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  // 1. Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (search) params.set('search', search);
      else params.delete('search');

      if (status) params.set('status', status);
      else params.delete('status');

      router.replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, pathname, router, searchParams, status]);

  // 2. Handle Status change immediately
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) params.set('status', newStatus);
    else params.delete('status');

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          type="text"
          placeholder="Search by Case No. or Location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // FIXED: Added focus:ring-inset
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-inset focus:ring-[#0b2d6b] focus:outline-none bg-white"
        />
      </div>

      {/* Status Filter */}
      <select
        value={status}
        onChange={handleStatusChange}
        // FIXED: Added focus:ring-inset
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-inset focus:ring-[#0b2d6b] focus:outline-none bg-white min-w-[200px]"
      >
        <option value="">All Statuses</option>
        <option value="Under Investigation">Under Investigation</option>
        <option value="In Prosecution">In Prosecution</option>
        <option value="Charged / Filed">Charged / Filed</option>
        <option value="Settled">Settled</option>
        <option value="Dismissed">Dismissed</option>
      </select>
    </div>
  );
}