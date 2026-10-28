import { createClient } from '@/lib/supabase/server';
import { connection } from 'next/server';

export default async function UserMenu() {
  await connection(); 
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Added 'hidden sm:block' to hide email on very small screens */}
      <span className="text-sm hidden sm:block">
        {user?.email || 'Authorized User'}
      </span>
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-[#0a192f] font-bold text-sm">
        {user?.email?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  );
}