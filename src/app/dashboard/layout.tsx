import Sidebar from "@/components/layout/Sidebar";
import UserMenu from "@/components/layout/UserMenu";
import LogoutButton from "@/components/layout/LogoutButton";
import MobileNav from "@/components/layout/MobileNav";
import SessionTimeout from "@/components/layout/SessionTimeout";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch the role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  // NEW: Fetch the categories from the database
  const { data: categories } = await supabase
    .from('incident_types')
    .select('id, name')
    .order('name');

  const userRole = profile?.role || 'viewer';

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <SessionTimeout />
      
      {/* Pass categories to Sidebar */}
      <Sidebar role={userRole} categories={categories || []} />

      <div className="flex-1 flex flex-col h-full w-full min-w-0">
        
        {/* Top Header */}
        <header className="bg-[#0a192f] text-white p-3 md:p-4 flex justify-between items-center shadow-md z-40 flex-shrink-0">
          
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            {/* Pass categories to MobileNav */}
            <MobileNav role={userRole} categories={categories || []} />
            <h1 className="text-[11px] sm:text-sm md:text-lg font-bold truncate">
              MARITIME SECURITY LAW ENFORCEMENT (D14)
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            <Suspense fallback={<div className="text-sm">Loading...</div>}>
              <UserMenu />
            </Suspense>
            <LogoutButton />
          </div>
          
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
        
      </div>
    </div>
  );
}