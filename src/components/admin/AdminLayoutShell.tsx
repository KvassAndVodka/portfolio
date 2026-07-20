"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import AdminSidebar from "@/app/admin/AdminSidebar";

interface AdminUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function AdminLayoutShell({ children, user }: { children: React.ReactNode; user?: AdminUser }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSidebarOpen]);

  return (
    <div className="admin-shell flex flex-col md:flex-row">
      <header className="admin-surface sticky top-0 z-30 flex min-h-16 items-center justify-between border-b px-4 md:hidden">
        <div><Link href="/admin" className="font-semibold tracking-[-0.025em]">Javier Raut</Link><p className="text-xs admin-muted">Portfolio admin</p></div>
        <button ref={menuButtonRef} type="button" className="admin-icon-button" onClick={() => setIsSidebarOpen((open) => !open)} aria-label={isSidebarOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={isSidebarOpen} aria-controls="admin-navigation">
          {isSidebarOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </header>

      {isSidebarOpen && <button type="button" className="fixed inset-0 z-20 bg-black/55 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close admin navigation" />}

      <aside id="admin-navigation" aria-label="Admin navigation" className={`admin-surface fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r transition-transform duration-200 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="hidden min-h-24 border-b border-[var(--admin-border)] px-6 py-5 md:block">
          <Link href="/admin" className="text-lg font-semibold tracking-[-0.03em]">Javier Raut</Link>
          <p className="mt-1 text-sm admin-muted">Portfolio admin</p>
        </div>
        <div className="flex-1 overflow-y-auto"><AdminSidebar onNavigate={() => setIsSidebarOpen(false)} /></div>
        <div className="border-t border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            {user?.image ? <Image src={user.image} alt="" width={36} height={36} className="rounded-full" /> : <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--accent-ink)]">{user?.name?.charAt(0) || "A"}</div>}
            <div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name || "Administrator"}</p><p className="truncate text-xs admin-muted">{user?.email}</p></div>
          </div>
        </div>
      </aside>

      <main className="min-h-[calc(100dvh-4rem)] flex-1 overflow-x-hidden md:ml-64 md:min-h-screen">
        <div className="mx-auto max-w-[90rem] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
