'use client';

import { logout } from '@/app/actions/auth';
import { FaRightFromBracket } from 'react-icons/fa6';

export default function SignOutButton() {
    return (
        <form action={logout}>
            <button 
                type="submit"
                className="admin-button-secondary hover:!border-[var(--admin-danger)] hover:!text-[var(--admin-danger)]"
            >
                <FaRightFromBracket className="shrink-0" aria-hidden="true" />
                Sign out
            </button>
        </form>
    );
}
