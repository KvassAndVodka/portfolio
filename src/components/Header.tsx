"use client";

import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const mainContent = document.getElementById("main-content");
    const menuButton = menuButtonRef.current;
    const mainWasInert = mainContent?.inert ?? false;
    const previousAriaHidden = mainContent?.getAttribute("aria-hidden");
    const focusFirstLink = window.requestAnimationFrame(() => {
      firstMenuLinkRef.current?.focus({ preventScroll: true });
    });

    const handleMenuKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocusRef.current = true;
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    if (mainContent) {
      mainContent.inert = true;
      mainContent.setAttribute("aria-hidden", "true");
    }
    window.addEventListener("keydown", handleMenuKeys);

    return () => {
      window.cancelAnimationFrame(focusFirstLink);
      document.body.style.overflow = previousOverflow;
      if (mainContent) {
        mainContent.inert = mainWasInert;
        if (previousAriaHidden == null) mainContent.removeAttribute("aria-hidden");
        else mainContent.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleMenuKeys);
      if (restoreFocusRef.current) {
        menuButton?.focus();
        restoreFocusRef.current = false;
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    const desktopNavigation = window.matchMedia("(min-width: 768px)");
    const closeAtDesktopWidth = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };

    desktopNavigation.addEventListener("change", closeAtDesktopWidth);
    return () => desktopNavigation.removeEventListener("change", closeAtDesktopWidth);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 20);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  if (pathname?.startsWith("/admin")) return null;

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => {
    if (isMenuOpen) restoreFocusRef.current = true;
    setIsMenuOpen((open) => !open);
  };
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && currentHash !== "#contact";
    if (href.startsWith("/#")) return pathname === "/" && currentHash === href.slice(1);
    return pathname?.startsWith(href);
  };

  return (
    <m.header
      ref={headerRef}
      className="site-header fixed inset-x-0 top-0 z-30 h-[4.5rem] border-b site-rule"
      data-scrolled={isScrolled}
    >
      <div className="header-inner site-shell flex h-full items-center justify-between">
        <Link className="brand-lockup" href="/" onClick={closeMenu}>
          <strong>Javier Raut</strong>
          <span aria-hidden="true" className="brand-signal" />
        </Link>

        <nav aria-label="Primary navigation" className="primary-navigation hidden items-center md:flex">
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className="primary-nav-link"
              href={item.href}
              key={item.href}
            >
              <span className="primary-nav-label">
                <span>{item.label}</span>
                <span aria-hidden="true">{item.label}</span>
              </span>
              {isActive(item.href) && (
                <m.span
                  aria-hidden="true"
                  className="primary-nav-indicator"
                  layoutId="primary-navigation-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </Link>
          ))}
          <span className="header-theme-toggle">
            <ThemeToggle />
          </span>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <span className="header-theme-toggle">
            <ThemeToggle />
          </span>
          <m.button
            ref={menuButtonRef}
            type="button"
            className="header-menu-button flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={toggleMenu}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <AnimatePresence initial={false} mode="wait">
              <m.span
                key={isMenuOpen ? "close" : "menu"}
                initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.9 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              >
                {isMenuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
              </m.span>
            </AnimatePresence>
          </m.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <m.div
            ref={menuRef}
            id="mobile-navigation"
            className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto border-t site-rule bg-[var(--background)] py-6 md:hidden sm:py-10"
            initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={reduceMotion ? undefined : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <m.nav
              aria-label="Mobile navigation"
              className="site-shell flex flex-col"
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { delayChildren: 0.04, staggerChildren: 0.04 } },
              }}
            >
              {navigation.map((item, index) => (
                <m.div
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, x: -32 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <Link
                    ref={index === 0 ? firstMenuLinkRef : undefined}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="mobile-nav-link flex min-h-16 items-center justify-between border-b site-rule text-2xl font-medium tracking-tight"
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                    <FaArrowRight aria-hidden="true" className="text-[var(--accent)]" />
                  </Link>
                </m.div>
              ))}
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
