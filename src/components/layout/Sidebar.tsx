'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// Added default value `= []` to categories
export default function Sidebar({ role, categories = [] }: { role: string, categories?: { id: string, name: string }[] }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) => {
    return `flex items-center gap-3 px-6 py-3 transition ${
      isActive(path)
        ? 'bg-[#112a4a] border-l-4 border-blue-400 font-semibold text-white'
        : 'text-gray-300 hover:bg-[#112a4a] hover:text-white'
    }`;
  };

  return (
    <aside className="w-64 bg-[#0a192f] text-white h-full overflow-y-auto flex-col hidden md:flex flex-shrink-0">
      
      <div className="p-5 flex items-center gap-3 border-b border-blue-900 flex-shrink-0">
        <div className="w-12 h-12 relative flex-shrink-0">
           <Image src="/STL.png" alt="PCG Logo" fill sizes="48px" className="object-contain" />
        </div>
        <div>
          <h2 className="font-bold text-[13px] leading-tight text-white mb-0.5">
            COAST GUARD DISTRICT<br />SOUTHERN TAGALOG
          </h2>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <span className="text-sm">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/incidents" className={linkClass('/dashboard/incidents')}>
              <span className="text-sm">All Incidents</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/operations" className={linkClass('/dashboard/operations')}>
              <span className="text-sm">Operations</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/recap" className={linkClass('/dashboard/recap')}>
              <span className="text-sm">Operations Recap</span>
            </Link>
          </li>
          
          {role === 'admin' && (
            <li>
              <Link href="/dashboard/personnel" className={linkClass('/dashboard/personnel')}>
                <span className="text-sm">Personnel</span>
              </Link>
            </li>
          )}

          <li>
            <Link href="/dashboard/persons" className={linkClass('/dashboard/persons')}>
              <span className="text-sm">Persons/Companies</span>
            </Link>
          </li>
          
          <li className="pt-4 pb-2 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Categories</li>
          
          {/* DYNAMIC CATEGORIES */}
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link 
                href={`/dashboard/incidents?type=${encodeURIComponent(cat.name)}`} 
                className="block px-6 py-2 text-sm text-gray-300 hover:bg-[#112a4a] hover:text-white"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          
          <li className="pt-4 pb-2 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account</li>
          <li>
            <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-sm">Account & Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}