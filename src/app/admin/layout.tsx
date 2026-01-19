import { auth } from '@/auth';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Fetch Session
  const session = await auth();
  const user = session?.user;

  return (
    <AdminLayoutShell user={user}>
        {children}
    </AdminLayoutShell>
  );
}
