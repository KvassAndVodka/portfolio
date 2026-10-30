"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { FaArrowRight, FaBars, FaXmark } from "react-icons/fa6";

import useReducedMotion from "@/hooks/useReducedMotion";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuIconRef = useRef<HTMLSpanElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
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

  useGSAP(() => {
    ScrollTrigger.create({
      start: 20,
      end: "max",
      onToggle: (self) => setIsScrolled(self.isActive),
      onRefresh: (self) => setIsScrolled(self.isActive),
    });
  });

  // Keep the panel mounted while it animates out, then unmount it.
  useGSAP(
    () => {
      if (isMenuOpen) {
        setIsMenuRendered(true);
        return;
      }
      const panel = menuRef.current;
      if (!panel || reduceMotion) {
        setIsMenuRendered(false);
        return;
      }
      gsap.to(panel, {
        autoAlpha: 0,
        clipPath: "inset(0 0 100% 0)",
        duration: 0.28,
        onComplete: () => setIsMenuRendered(false),
      });
    },
    { dependencies: [isMenuOpen, reduceMotion] },
  );

  useGSAP(
    () => {
      const panel = menuRef.current;
      if (!isMenuOpen || !isMenuRendered || !panel || reduceMotion) return;
      gsap
        .timeline()
        .fromTo(
          panel,
          { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 0.28 },
        )
        .from(panel.querySelectorAll(".mobile-nav-item"), { autoAlpha: 0, x: -32, duration: 0.24, stagger: 0.04 }, 0.04);
    },
    { dependencies: [isMenuOpen, isMenuRendered, reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion) return;
      gsap.fromTo(menuIconRef.current, { autoAlpha: 0, rotate: -45, scale: 0.9 }, { autoAlpha: 1, rotate: 0, scale: 1, duration: 0.18 });
    },
    { dependencies: [isMenuOpen], revertOnUpdate: false },
  );

  const activeHref = navigation.find(({ href }) => {
    if (href === "/") return pathname === "/" && currentHash !== "#contact";
    if (href.startsWith("/#")) return pathname === "/" && currentHash === href.slice(1);
    return pathname?.startsWith(href);
  })?.href;

  // One indicator that glides to whichever link is active.
  useGSAP(
    () => {
      const indicator = indicatorRef.current;
      const link = navigationRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!indicator) return;
      if (!link) {
        gsap.to(indicator, { autoAlpha: 0, duration: 0.2 });
        return;
      }
      const wasHidden = gsap.getProperty(indicator, "autoAlpha") === 0;
      gsap.to(indicator, {
        x: link.offsetLeft,
        width: link.offsetWidth,
        autoAlpha: 1,
        duration: reduceMotion || wasHidden ? 0 : 0.42,
      });
    },
    { dependencies: [activeHref, reduceMotion], revertOnUpdate: false },
  );

  if (pathname?.startsWith("/admin")) return null;

  const closeMenu = () => setIsMenuOpen(false);
  const handleHomeClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    closeMenu();
    if (pathname !== "/") return;

    event.preventDefault();
    if (window.location.hash) window.history.replaceState(null, "", "/");
    setCurrentHash("");
    // On the story homepage, cut straight back to the intro instead of scrolling back through it.
    const handledByStory = !window.dispatchEvent(new CustomEvent("story:jump", { cancelable: true, detail: { top: 0 } }));
    if (!handledByStory) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const toggleMenu = () => {
    if (isMenuOpen) restoreFocusRef.current = true;
    setIsMenuOpen((open) => !open);
  };
  const isActive = (href: string) => href === activeHref;

  return (
    <header
      ref={headerRef}
      className="site-header sticky top-0 z-30 border-b site-rule"
      data-scrolled={isScrolled}
    >
      <div className="header-inner site-shell flex h-full items-center justify-between">
        <Link className="brand-lockup" href="/" onClick={handleHomeClick}>
          <strong>Javier Raut</strong>
          <span aria-hidden="true" className="brand-signal" />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="primary-navigation relative hidden items-center md:flex"
          ref={navigationRef}
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className="primary-nav-link"
              href={item.href}
              key={item.href}
              onClick={item.href === "/" ? handleHomeClick : undefined}
            >
              <span className="primary-nav-label">
                <span>{item.label}</span>
                <span aria-hidden="true">{item.label}</span>
              </span>
            </Link>
          ))}
          <span aria-hidden="true" className="primary-nav-indicator" ref={indicatorRef} />
          <span className="header-theme-toggle">
            <ThemeToggle />
          </span>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <span className="header-theme-toggle">
            <ThemeToggle />
          </span>
          <button
            ref={menuButtonRef}
            type="button"
            className="header-menu-button flex min-h-11 min-w-11 items-center justify-center rounded-[0.75rem] border site-rule px-3 text-xs font-semibold"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={toggleMenu}
          >
            <span ref={menuIconRef} className="inline-flex">
              {isMenuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            </span>
          </button>
        </div>
      </div>

      {isMenuRendered && (
          <div
            ref={menuRef}
            id="mobile-navigation"
            className="mobile-navigation-panel absolute inset-x-0 top-full overflow-y-auto border-t site-rule bg-[var(--background)] py-6 md:hidden sm:py-10"
          >
            <nav aria-label="Mobile navigation" className="site-shell flex flex-col">
              {navigation.map((item, index) => (
                <div className="mobile-nav-item" key={item.href}>
                  <Link
                    ref={index === 0 ? firstMenuLinkRef : undefined}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="mobile-nav-link flex min-h-16 items-center justify-between border-b site-rule text-2xl font-medium tracking-tight"
                    href={item.href}
                    onClick={item.href === "/" ? handleHomeClick : closeMenu}
                  >
                    {item.label}
                    <FaArrowRight aria-hidden="true" className="text-[var(--accent)]" />
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        )}
    </header>
  );
}
