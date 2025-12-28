import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-stone-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Javier Raut
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Home
          </Link>
          <Link href="/work" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Projects
          </Link>
          <Link href="/blog" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Blog
          </Link>
          <a href="mailto:javier.raut@gmail.com" className="text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}