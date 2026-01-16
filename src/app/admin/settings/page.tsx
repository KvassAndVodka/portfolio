import { revalidateAll } from '@/lib/actions';
import ThemeSettings from './ThemeSettings';
import { FaSync, FaShieldAlt, FaPalette } from 'react-icons/fa';

export default function AdminSettings() {
    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-2xl bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Settings</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Configure system preferences and maintenance.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Appearance Section */}
                <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-full">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><FaPalette size={14} /></span>
                        Appearance
                    </h2>
                    <ThemeSettings />
                </div>

                {/* System Section */}
                <div className="bg-white dark:bg-[#0c0a09] border border-stone-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-full">
                     <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-stone-900 dark:text-stone-100">
                        <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><FaShieldAlt size={14} /></span>
                        System
                    </h2>
                    
                    <div className="flex flex-col justify-between p-5 bg-stone-50/50 dark:bg-stone-900/20 rounded-xl border border-stone-200 dark:border-white/5 space-y-4">
                        <div>
                            <h3 className="font-bold text-stone-900 dark:text-stone-200">Revalidate Cache</h3>
                            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                                Force a refresh of all cached data. Use this if updates aren't appearing on the public site immediately.
                            </p>
                        </div>
                        <form action={revalidateAll}>
                            <button className="w-full px-4 py-3 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-200 rounded-lg text-sm font-bold border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 transition-all shadow-sm">
                                <FaSync size={14} /> Purge & Revalidate
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div className="text-center pt-10 border-t border-stone-100 dark:border-white/5">
                 <p className="text-xs font-mono text-stone-400 dark:text-stone-600">
                    Portfolio v1.0.0 • Next.js • Prisma • PostgreSQL
                 </p>
            </div>
        </div>
    );
}
