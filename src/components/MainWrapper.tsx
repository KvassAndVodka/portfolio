"use client";

import { usePathname } from 'next/navigation';

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <main id="main-content" className={isAdmin ? "" : "pt-[4.5rem]"} tabIndex={-1}>
      {children}
    </main>
  );
}
