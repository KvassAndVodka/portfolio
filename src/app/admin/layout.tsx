import type { Metadata } from 'next';

import { auth } from '@/auth';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { adminPreviewUser, isAdminPreviewEnabled } from '@/lib/admin-preview';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isPreview = isAdminPreviewEnabled();
  const session = isPreview ? null : await auth();
  const user = session?.user ?? (isPreview ? adminPreviewUser : undefined);

  return (
    <AdminLayoutShell user={user}>
      {children}
    </AdminLayoutShell>
  );
}
