"use client";

import Link from 'next/link';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-stone-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg tracking-tight z-50 relative" onClick={closeMenu}>
          Javier Raut
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="/" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Home
          </Link>
          <Link href="/projects" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Projects
          </Link>
          <Link href="/blog" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Blog
          </Link>
          <a href="mailto:javier.raut@gmail.com" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Contact
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-50 p-2 text-stone-900 dark:text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Mobile Navigation Overlay */}
        <div className={`fixed inset-0 bg-stone-50/95 dark:bg-[#0c0a09]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <nav className="flex flex-col items-center gap-8 text-xl font-medium">
            <Link href="/" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
              Home
            </Link>
            <Link href="/projects" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
              Projects
            </Link>
            <Link href="/blog" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
              Blog
            </Link>
            <a href="mailto:javier.raut@gmail.com" onClick={closeMenu} className="text-stone-900 dark:text-stone-100 hover:text-[var(--accent)] transition">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}