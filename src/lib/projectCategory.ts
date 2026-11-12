// Kept out of ProjectCard (a client module) so server components can call it.
export function formatProjectCategory(category?: string) {
  if (!category) return "Independent project";

  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
