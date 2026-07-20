import { permanentRedirect } from "next/navigation";

export default async function LegacyArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/notes/${slug}`);
}
