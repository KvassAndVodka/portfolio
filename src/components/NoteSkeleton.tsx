export default function NoteSkeleton() {
  return (
    <div className="note-skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-line-short skeleton-shimmer" />
      <div className="note-skeleton-copy">
        <div className="skeleton-line skeleton-line-title skeleton-shimmer" />
        <div className="skeleton-line skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-medium skeleton-shimmer" />
      </div>
      <div className="skeleton-line skeleton-line-short skeleton-shimmer" />
    </div>
  );
}
