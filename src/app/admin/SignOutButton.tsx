'use client';

import { logout } from '@/app/actions/auth';
import { FaRightFromBracket } from 'react-icons/fa6';

export default function SignOutButton() {
    return (
        <form action={logout}>
            <button 
                type="submit"
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium admin-muted hover:bg-[var(--admin-danger-soft)] hover:text-[var(--admin-danger)]"
            >
                <FaRightFromBracket className="w-5" aria-hidden="true" />
                Sign out
            </button>
        </form>
    );
}
