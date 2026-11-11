import { auth } from "@/auth";
import { isAdminPreviewEnabled } from "@/lib/admin-preview";

// Server actions and API routes are reachable outside /admin, so the proxy alone does not protect them.
export async function requireAdmin() {
  if (isAdminPreviewEnabled()) return;
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}
