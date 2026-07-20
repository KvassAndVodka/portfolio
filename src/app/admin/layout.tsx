import { auth } from '@/auth';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { adminPreviewUser, isAdminPreviewEnabled } from '@/lib/admin-preview';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isPreview = isAdminPreviewEnabled();
  const session = isPreview ? null : await auth();
  const user = session?.user ?? (isPreview ? adminPreviewUser : undefined);

  return (
    <AdminLayoutShell user={user}>
        {children}
    </AdminLayoutShell>
  );
}
