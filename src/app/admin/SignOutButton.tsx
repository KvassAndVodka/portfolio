'use client';

import { logout } from '@/app/actions/auth';
import { FaSignOutAlt } from 'react-icons/fa';

export default function SignOutButton() {
    return (
        <form action={logout}>
            <button 
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-red-500/10 transition-all group"
            >
                <span className="text-lg text-stone-400 group-hover:text-red-500 dark:text-stone-500 dark:group-hover:text-red-400 transition-colors">
                    <FaSignOutAlt /> 
                </span>
                Sign Out
            </button>
        </form>
    );
}
