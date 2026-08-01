"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { FaBars, FaXmark } from "react-icons/fa6";
import AdminSidebar from "@/app/admin/AdminSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/app/admin/SignOutButton";
import { useRouter } from "next/navigation";

interface AdminUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type AdminLayoutShellProps = Readonly<{
  children: React.ReactNode;
  user?: AdminUser;
}>;

export default function AdminLayoutShell({ children, user }: AdminLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const destinations = ["/admin/notes", "/admin/media", "/admin/projects"];
    const warmAdminRoutes = () => destinations.forEach((destination) => router.prefetch(destination));
    const idleWindow = window as typeof window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number; cancelIdleCallback?: (handle: number) => void };
    const idleHandle = idleWindow.requestIdleCallback?.(warmAdminRoutes, { timeout: 1200 });

    if (idleHandle === undefined) {
      const timeout = window.setTimeout(warmAdminRoutes, 250);
      return () => window.clearTimeout(timeout);
    }

    return () => idleWindow.cancelIdleCallback?.(idleHandle);
  }, [router]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSidebarOpen]);

  return (
    <div className="admin-shell flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
      <header className="admin-surface z-30 flex min-h-16 shrink-0 items-center justify-between border-b px-4 md:hidden">
        <div><Link href="/admin" className="brand-lockup"><span className="font-semibold tracking-[-0.025em]">Javier Raut</span><span aria-hidden="true" className="brand-signal" /></Link><p className="text-xs admin-muted">Portfolio admin</p></div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <m.button ref={menuButtonRef} type="button" className="admin-icon-button" onClick={() => setIsSidebarOpen((open) => !open)} aria-label={isSidebarOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={isSidebarOpen} aria-controls="admin-navigation" whileTap={reduceMotion ? undefined : { scale: 0.94 }}>
            <AnimatePresence initial={false} mode="wait">
              <m.span key={isSidebarOpen ? "close" : "open"} initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.86 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.86 }} transition={{ duration: reduceMotion ? 0 : 0.16 }}>
                {isSidebarOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
              </m.span>
            </AnimatePresence>
          </m.button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {isSidebarOpen && <m.button type="button" className="fixed inset-0 z-20 bg-black/55 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close admin navigation" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} />}
      </AnimatePresence>

      <aside id="admin-navigation" aria-label="Admin navigation" className={`admin-surface fixed inset-y-0 left-0 z-30 flex h-dvh w-64 flex-col border-r transition-transform duration-200 ease-[var(--ease-out-expo)] md:static md:h-full md:shrink-0 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-[var(--admin-border)] px-5 py-5">
          <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="brand-lockup"><span className="text-lg font-semibold tracking-[-0.03em]">Javier Raut</span><span aria-hidden="true" className="brand-signal" /></Link>
          <p className="mt-1 text-sm admin-muted">Portfolio admin</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto"><AdminSidebar onNavigate={() => setIsSidebarOpen(false)} /></div>
        <div className="shrink-0 border-t border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            {user?.image ? <Image src={user.image} alt="" width={36} height={36} className="rounded-full" /> : <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--accent-ink)]">{user?.name?.charAt(0) || "A"}</div>}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.name || "Administrator"}</p><p className="truncate text-xs admin-muted">{user?.email}</p></div>
            <ThemeToggle />
          </div>
          <div className="mt-2"><SignOutButton /></div>
        </div>
      </aside>

      <div className={`min-h-0 flex-1 overflow-x-hidden ${isSidebarOpen ? "overflow-y-hidden md:overflow-y-auto" : "overflow-y-auto"}`}>
        <div className="mx-auto max-w-[90rem] p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
