import type { Metadata } from 'next';
import { connection } from 'next/server';

import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Admin pages read live data and sit behind sign-in, so render them per request, never at build time.
  await connection();
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
