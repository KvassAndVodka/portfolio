'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

export default function ThemeSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-24 bg-stone-100 dark:bg-white/5 animate-pulse rounded-2xl"></div>;

    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">Interface Theme</label>
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        theme === 'light' 
                        ? 'bg-stone-50 border-[var(--accent)] text-[var(--accent)] ring-1 ring-[var(--accent)]' 
                        : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10'
                    }`}
                >
                    <FaSun size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Light</span>
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        theme === 'dark' 
                        ? 'bg-stone-900 border-[var(--accent)] text-[var(--accent)] ring-1 ring-[var(--accent)] shadow-[0_0_20px_-10px_var(--accent)]' 
                        : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10'
                    }`}
                >
                    <FaMoon size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Dark</span>
                </button>
                <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        theme === 'system' 
                        ? 'bg-stone-100 dark:bg-stone-800 border-[var(--accent)] text-[var(--accent)] ring-1 ring-[var(--accent)]' 
                        : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10'
                    }`}
                >
                    <FaDesktop size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">System</span>
                </button>
            </div>
        </div>
    );
}
