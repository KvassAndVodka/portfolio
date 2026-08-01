"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";
import {
  FaArrowRight,
  FaChartSimple,
  FaFileLines,
  FaGear,
  FaImages,
  FaLaptopCode,
  FaTrashCan,
} from "react-icons/fa6";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: FaChartSimple, exact: true },
  { label: "Projects", href: "/admin/projects", icon: FaLaptopCode },
  { label: "Notes", href: "/admin/notes", icon: FaFileLines },
  { label: "Media", href: "/admin/media", icon: FaImages },
  { label: "Trash", href: "/admin/trash", icon: FaTrashCan },
];

export default function AdminSidebar({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const warmRoute = (href: string) => {
    router.prefetch(href);
  };

  return (
    <nav className="px-3 py-4" aria-label="Primary">
      <Link
        href="/"
        onClick={onNavigate}
        onMouseEnter={() => warmRoute("/")}
        onFocus={() => warmRoute("/")}
        className="mb-4 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] px-3 text-sm font-semibold text-[var(--admin-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-hover)]"
      >
        <span>View site</span>
        <FaArrowRight aria-hidden="true" className="text-[0.8rem]" />
      </Link>
      <ul className="space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) || (item.href === "/admin/notes" && pathname.startsWith("/admin/archives"));
          const Icon = item.icon;
          return (
            <m.li key={item.href} whileHover={reduceMotion ? undefined : { x: 2 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }}>
              <Link href={item.href} onClick={onNavigate} onMouseEnter={() => warmRoute(item.href)} onFocus={() => warmRoute(item.href)} aria-current={active ? "page" : undefined} className={`relative flex min-h-11 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-medium ${active ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted hover:bg-[var(--admin-surface-subtle)] hover:text-[var(--admin-foreground)]"}`}>
                <Icon className="w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {active && <m.span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--accent)]" layoutId="admin-navigation-indicator" transition={{ type: "spring", stiffness: 520, damping: 38 }} />}
              </Link>
            </m.li>
          );
        })}
      </ul>
      <div className="my-5 border-t border-[var(--admin-border)]" />
      <m.div whileHover={reduceMotion ? undefined : { x: 2 }} whileTap={reduceMotion ? undefined : { scale: 0.985 }}>
        <Link href="/admin/settings" onClick={onNavigate} onMouseEnter={() => warmRoute("/admin/settings")} onFocus={() => warmRoute("/admin/settings")} aria-current={pathname === "/admin/settings" ? "page" : undefined} className={`relative flex min-h-11 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-medium ${pathname === "/admin/settings" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted hover:bg-[var(--admin-surface-subtle)] hover:text-[var(--admin-foreground)]"}`}><FaGear className="w-5 shrink-0" aria-hidden="true" /><span>Settings</span>{pathname === "/admin/settings" && <m.span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--accent)]" layoutId="admin-navigation-indicator" transition={{ type: "spring", stiffness: 520, damping: 38 }} />}</Link>
      </m.div>
    </nav>
  );
}
