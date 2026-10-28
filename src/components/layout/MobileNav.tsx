'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function MobileNav({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'All Incidents', path: '/dashboard/incidents' },
    { name: 'Operations Recap', path: '/dashboard/recap' },
    { name: 'Personnel', path: '/dashboard/personnel' },
  ];

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(true)} className="text-white p-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-64 bg-[#0a192f] h-full shadow-2xl flex flex-col animate-fade-in">
            <div className="p-4 flex justify-between items-center border-b border-blue-900">
               <div className="w-10 h-10 relative flex-shrink-0">
                 <Image src="/STL.png" alt="Logo" fill sizes="40px" className="object-contain" />
               </div>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {links.map((link) => {
                  const isActive = link.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.path);
                  return (
                    <li key={link.path}>
                      <Link href={link.path} onClick={() => setIsOpen(false)} className={`block px-6 py-3 text-sm ${isActive ? 'bg-[#112a4a] border-l-4 border-blue-400 font-semibold text-white' : 'text-gray-300 hover:bg-[#112a4a] hover:text-white'}`}>
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
                {/* ADMIN SETTINGS LINK */}
                {role === 'admin' && (
                  <li>
                    <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className={`block px-6 py-3 text-sm ${pathname.startsWith('/dashboard/settings') ? 'bg-[#112a4a] border-l-4 border-blue-400 font-semibold text-white' : 'text-gray-300 hover:bg-[#112a4a] hover:text-white'}`}>
                      Admin Settings
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}