"use client";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

/** The items on `page` (1-based), and how many pages there are. */
export function paginate<T>(items: readonly T[], page: number, size: number) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}

type PaginationProps = Readonly<{
  page: number;
  pages: number;
  label: string;
  onChange: (page: number) => void;
}>;

const pad = (value: number) => String(value).padStart(2, "0");

/** Page numbers in mono, the current one as the orange tab. Renders nothing for a single page. */
export default function Pagination({ page, pages, label, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" className="pagination-step" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <FaArrowLeft aria-hidden="true" />
        <span>Prev</span>
      </button>
      {/* shortcut: every page number is listed; collapse the middle with an ellipsis past ~10 pages. */}
      <ol>
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <li key={number}>
            <button
              type="button"
              aria-current={number === page ? "page" : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onChange(number)}
            >
              {pad(number)}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="pagination-step" onClick={() => onChange(page + 1)} disabled={page === pages}>
        <span>Next</span>
        <FaArrowRight aria-hidden="true" />
      </button>
    </nav>
  );
}
