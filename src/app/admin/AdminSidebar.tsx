'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLayerGroup, FaBriefcase, FaFileAlt, FaImages, FaCog, FaTrash } from 'react-icons/fa';
import SignOutButton from './SignOutButton';
import { useMemo } from 'react';

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = useMemo(() => [
        { label: 'Dashboard', href: '/admin', icon: <FaLayerGroup />, exact: true },
        { label: 'Projects', href: '/admin/projects', icon: <FaBriefcase /> },
        { label: 'Archives', href: '/admin/archives', icon: <FaFileAlt /> },
        { label: 'Media', href: '/admin/media', icon: <FaImages /> },
        { label: 'Trash', href: '/admin/trash', icon: <FaTrash /> },
    ], []);

    return (
        <nav className="flex-1 px-4 py-6 space-y-1">
            <div className="space-y-1">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.href} 
                        {...item} 
                        active={item.exact ? pathname === item.href : pathname?.startsWith(item.href)} 
                    />
                ))}
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200 dark:border-white/5">
                <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">System</p>
                <NavLink 
                    label="Settings" 
                    href="/admin/settings" 
                    icon={<FaCog />} 
                    active={pathname === '/admin/settings'} 
                />
                 <div className="mt-2">
                    <SignOutButton />
                </div>
            </div>
        </nav>
    )
}

function NavLink({ href, label, icon, active }: { href: string, label: string, icon: React.ReactNode, active: boolean }) {
    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                active 
                ? 'bg-stone-900 text-white dark:bg-white/10 dark:text-white shadow-sm' 
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
        >
            {active && (
                <div className="absolute left-0 w-1 h-6 bg-[var(--accent)] rounded-r-full" />
            )}
            <span className={`text-lg ${active ? 'text-[var(--accent)]' : 'text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300'}`}>
                {icon}
            </span>
            {label}
        </Link>
    )
}
