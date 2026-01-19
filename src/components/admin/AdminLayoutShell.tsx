"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import AdminSidebar from "@/app/admin/AdminSidebar";

export default function AdminLayoutShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-100 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#0c0a09] border-b border-stone-200 dark:border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-3">
             <Link href="/" className="font-bold tracking-tight text-lg">Javier Raut</Link>
             <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-stone-600 dark:text-stone-400">
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-stone-50 dark:bg-[#0c0a09] border-r border-stone-200 dark:border-white/10 flex flex-col transition-transform duration-300 md:translate-x-0 md:fixed md:inset-y-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
          {/* Branding (Desktop only - Mobile has its own header) */}
          <div className="p-6 border-b border-stone-200 dark:border-white/10 hidden md:block">
            <Link href="/" className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 hover:opacity-80 transition-opacity">
                Javier Raut
            </Link>
            <p className="text-xs font-mono text-[var(--accent)] mt-1 uppercase tracking-widest">Admin /// Console</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
             <AdminSidebar />
        </div>
       

        {/* User Profile */}
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
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold font-mono shrink-0">
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

      {/* Main Content */}
      <main className="flex-1 bg-stone-100 dark:bg-[#111] min-h-[calc(100vh-64px)] md:min-h-screen transition-colors duration-300 overflow-x-hidden md:ml-64">
         <div className="max-w-7xl mx-auto p-4 md:p-8 md:pt-10">
            {children}
         </div>
      </main>

    </div>
  );
}
