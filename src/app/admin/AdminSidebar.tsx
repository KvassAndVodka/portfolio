"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartSimple, FaFileLines, FaGear, FaImages, FaLaptopCode, FaTrashCan } from "react-icons/fa6";
import SignOutButton from "./SignOutButton";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: FaChartSimple, exact: true },
  { label: "Projects", href: "/admin/projects", icon: FaLaptopCode },
  { label: "Notes", href: "/admin/notes", icon: FaFileLines },
  { label: "Media", href: "/admin/media", icon: FaImages },
  { label: "Trash", href: "/admin/trash", icon: FaTrashCan },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-5" aria-label="Primary">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) || (item.href === "/admin/notes" && pathname.startsWith("/admin/archives"));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${active ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted hover:bg-[var(--admin-surface-subtle)] hover:text-[var(--admin-foreground)]"}`}>
                <Icon className="w-5" aria-hidden="true" />{item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="my-5 border-t border-[var(--admin-border)]" />
      <Link href="/admin/settings" onClick={onNavigate} aria-current={pathname === "/admin/settings" ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${pathname === "/admin/settings" ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "admin-muted hover:bg-[var(--admin-surface-subtle)] hover:text-[var(--admin-foreground)]"}`}><FaGear className="w-5" aria-hidden="true" />Settings</Link>
      <div className="mt-1"><SignOutButton /></div>
    </nav>
  );
}
