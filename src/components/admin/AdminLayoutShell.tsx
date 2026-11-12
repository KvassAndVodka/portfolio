"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { FaFileLines, FaGear, FaHouse, FaImages, FaLaptopCode, FaPlus } from "react-icons/fa6";
import ThemeToggle from "@/components/ThemeToggle";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const navigation = [
  { label: "Desk", href: "/admin", exact: true },
  { label: "Notes", href: "/admin/notes" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Media", href: "/admin/media" },
  { label: "Trash", href: "/admin/trash" },
  { label: "Settings", href: "/admin/settings" },
];

// Phones get the five places used most; Trash is linked from Settings.
const tabs = [
  { label: "Desk", href: "/admin", icon: FaHouse, exact: true },
  { label: "Notes", href: "/admin/notes", icon: FaFileLines },
  { label: "Write", href: "/admin/create?type=BLOG", icon: FaPlus },
  { label: "Projects", href: "/admin/projects", icon: FaLaptopCode },
  { label: "Media", href: "/admin/media", icon: FaImages },
];

const tabLabel = "font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em]";

/**
 * The admin in the public site's identity: the ticket-strip header on desktop, a tab bar on phones.
 * Each page's `data-reveal` elements rise in on arrival, the same restrained motion as the public pages.
 */
export default function AdminLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) || (href === "/admin/notes" && pathname.startsWith("/admin/archives"));

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-reveal]", { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.04, clearProps: "transform,opacity,visibility" });
    },
    { scope: mainRef, dependencies: [pathname] },
  );

  return (
    <div className="admin-shell flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="site-header z-30 shrink-0">
        <div className="header-inner site-shell flex h-full items-center justify-between">
          <Link className="brand-lockup" href="/admin" aria-label="Admin desk">
            <strong aria-hidden="true">JR<span className="brand-dot">.</span></strong>
          </Link>
          <span className="admin-label site-muted ml-5 mr-auto hidden lg:inline">Admin</span>

          <nav aria-label="Admin" className="primary-navigation relative hidden items-center md:flex">
            {navigation.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`primary-nav-link ${active ? "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[var(--postcard-orange)]" : ""}`}>
                  <span className="primary-nav-label"><span>{item.label}</span><span aria-hidden="true">{item.label}</span></span>
                </Link>
              );
            })}
            <Link href="/admin/create?type=BLOG" className="primary-nav-link primary-nav-contact">
              <span className="primary-nav-label"><span>Write</span><span aria-hidden="true">Write</span></span>
            </Link>
            <span className="header-theme-toggle"><ThemeToggle /></span>
          </nav>

          <div className="flex items-center gap-1 pr-1.5 md:hidden">
            <span className="header-theme-toggle"><ThemeToggle /></span>
            <Link href="/admin/settings" aria-label="Settings" aria-current={isActive("/admin/settings") ? "page" : undefined} className="grid size-11 place-items-center">
              <FaGear aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* The page scrolls here, not on the window, so Lenis (the public site's smooth scroll) stays out of it. */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" data-lenis-prevent>
        <main ref={mainRef} className="site-shell pb-16">{children}</main>
      </div>

      <nav aria-label="Admin" className="grid shrink-0 grid-cols-5 border-t border-[var(--line)] bg-[var(--postcard-paper)] pb-[env(safe-area-inset-bottom)] text-[var(--postcard-ink)] md:hidden">
        {tabs.map(({ label, href, icon: Icon, exact }) => {
          const write = label === "Write";
          const active = !write && isActive(href, exact);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${tabLabel} flex min-h-16 flex-col items-center justify-center gap-1.5 ${write ? "bg-[var(--postcard-orange)] text-[var(--postcard-on-orange)]" : active ? "" : "text-[var(--postcard-muted)]"}`}>
              <Icon aria-hidden="true" className="text-base" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
