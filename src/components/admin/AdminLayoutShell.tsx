"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { FaFileLines, FaGear, FaHouse, FaImages, FaLaptopCode, FaPlus } from "react-icons/fa6";
import ThemeToggle from "@/components/ThemeToggle";
import Toaster from "@/components/admin/Toaster";

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
 * Each page's `data-reveal` elements rise in on arrival (CSS, see `.admin-shell [data-reveal]`).
 */
export default function AdminLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const [ruleReady, setRuleReady] = useState(false);
  // The link just clicked, so the rule slides at once instead of waiting for the next page to load.
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);
  const routeActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) || (href === "/admin/notes" && pathname.startsWith("/admin/archives"));
  const isActive = (href: string, exact?: boolean) =>
    pending && pending.from === pathname ? pending.href === href : routeActive(href, exact);
  const activeHref = navigation.find((item) => isActive(item.href, item.exact))?.href;

  // One orange rule under the header links that slides to the active one (transform only).
  useLayoutEffect(() => {
    const rule = ruleRef.current;
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`);
    if (!rule || !nav) return;
    rule.style.opacity = link ? "1" : "0";
    if (link) {
      const box = link.getBoundingClientRect();
      rule.style.transform = `translateX(${box.left - nav.getBoundingClientRect().left + 12}px) scaleX(${box.width - 24})`;
    }
    const frame = requestAnimationFrame(() => setRuleReady(true));
    return () => cancelAnimationFrame(frame);
  }, [activeHref]);

  return (
    <div className="admin-shell flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="site-header z-30 shrink-0">
        <div className="header-inner site-shell flex h-full items-center justify-between">
          <Link className="brand-lockup" href="/admin" aria-label="Admin desk">
            <strong aria-hidden="true">JR<span className="brand-dot">.</span></strong>
          </Link>
          <span className="admin-label site-muted ml-5 mr-auto hidden lg:inline">Admin</span>

          <nav ref={navRef} aria-label="Admin" className="primary-navigation relative hidden items-center md:flex">
            {navigation.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link key={item.href} href={item.href} data-href={item.href} aria-current={active ? "page" : undefined} onClick={() => setPending({ href: item.href, from: pathname })} className="primary-nav-link">
                  <span className="primary-nav-label"><span>{item.label}</span><span aria-hidden="true">{item.label}</span></span>
                </Link>
              );
            })}
            <span ref={ruleRef} aria-hidden="true" className="admin-tabs-rule" data-ready={ruleReady || undefined} />
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
      {/* Positioned, so absolutely placed children (screen-reader-only labels) stay inside it; otherwise they
          land below the screen and give the whole page a second scrollbar. */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden" data-lenis-prevent>
        <main className="site-shell pb-16">{children}</main>
      </div>

      <Toaster />

      <nav aria-label="Admin" className="grid shrink-0 grid-cols-5 border-t border-[var(--line)] bg-[var(--postcard-paper)] pb-[env(safe-area-inset-bottom)] text-[var(--postcard-ink)] md:hidden">
        {tabs.map(({ label, href, icon: Icon, exact }) => {
          const write = label === "Write";
          const active = !write && isActive(href, exact);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${tabLabel} admin-tab flex min-h-16 flex-col items-center justify-center gap-1.5 ${write ? "bg-[var(--postcard-orange)] text-[var(--postcard-on-orange)]" : active ? "" : "text-[var(--postcard-muted)]"}`}>
              <Icon aria-hidden="true" className="text-base" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
