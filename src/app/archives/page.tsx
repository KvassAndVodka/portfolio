import { permanentRedirect } from "next/navigation";

export default function LegacyArchivesPage() {
  permanentRedirect("/notes");
}
