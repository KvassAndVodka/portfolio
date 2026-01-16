"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // Hide header on admin pages
  if (pathname?.startsWith('/admin')) {
      return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Background Backdrop for Navbar */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        isMenuOpen 
          ? 'bg-transparent' 
          : 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-stone-200 dark:border-white/10'
      }`} />

      <div className="relative max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg tracking-tight z-50 relative" onClick={closeMenu}>
          Javier Raut
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm relative z-50">
          <Link href="/" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Home
          </Link>
          <Link href="/projects" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Projects
          </Link>
          <Link href="/archives" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Archives
          </Link>
          <Link href="/#contact" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Contact
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile: Theme Toggle + Menu Button */}
        <div className="flex items-center gap-2 md:hidden z-50 relative">
          <ThemeToggle />
          <button 
            className="p-2 text-stone-900 dark:text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 bg-stone-50/95 dark:bg-[#0c0a09]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <nav className="flex flex-col items-center gap-8 text-xl font-medium">
          <Link href="/" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
            Home
          </Link>
          <Link href="/projects" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
            Projects
          </Link>
          <Link href="/archives" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
            Archives
          </Link>
          <Link href="/#contact" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}