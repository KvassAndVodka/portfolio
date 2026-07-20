"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight, FaBars, FaXmark } from "react-icons/fa6";

import ThemeToggle from "./ThemeToggle";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/notes", label: "Notes" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname?.startsWith(href);
  };

  return (
    <header className="site-header fixed inset-x-0 top-0 z-30 h-[4.5rem] border-b site-rule bg-[var(--background)]/92 backdrop-blur-xl">
      <div className="site-shell flex h-full items-center justify-between">
        <Link className="brand-link text-[0.95rem] font-semibold tracking-[-0.025em]" href="/" onClick={closeMenu}>
          Javier Raut
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`primary-nav-link text-sm ${
                isActive(item.href)
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`fixed inset-x-0 top-[4.5rem] h-[calc(100dvh-4.5rem)] border-t site-rule bg-[var(--background)] px-4 py-10 md:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <nav aria-label="Mobile navigation" className="site-shell flex flex-col">
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className="flex min-h-16 items-center justify-between border-b site-rule text-2xl font-medium tracking-tight"
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
              <FaArrowRight aria-hidden="true" className="text-[var(--accent)]" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
