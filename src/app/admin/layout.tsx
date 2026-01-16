import Link from 'next/link';
import { auth } from '@/auth';
import Image from 'next/image';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Fetch Session
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#0c0a09] flex flex-col fixed h-full z-10 transition-colors duration-300">
        <div className="p-6 border-b border-stone-200 dark:border-white/10">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity">
                Javier Raut
            </Link>
            <p className="text-xs font-mono text-[var(--accent)] mt-1 uppercase tracking-widest">Admin /// Console</p>
        </div>

        {/* Client Component for Navigation */}
        <AdminSidebar />

        <div className="p-4 border-t border-stone-200 dark:border-white/10 bg-stone-100/50 dark:bg-white/5">
            <div className="flex items-center gap-3 p-2 rounded-lg">
                {user?.image ? (
                     <Image 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        width={32} 
                        height={32} 
                        className="rounded-full bg-stone-800"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold font-mono">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name}</p>
                    <p className="text-xs text-stone-500 font-mono truncate">{user?.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area - Shifted Right */}
      <main className="flex-1 ml-64 bg-stone-100 dark:bg-[#111] min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-8 pt-10">
           {children}
        </div>
      </main>
    </div>
  );
}
