export default function ProjectSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`project-card project-skeleton${featured ? " project-card-featured" : ""}`} aria-hidden="true">
      <div className="project-skeleton-media skeleton-shimmer" />
      <div className="project-card-body">
        <div className="skeleton-line skeleton-line-short skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-title skeleton-shimmer" />
        <div className="skeleton-copy">
          <div className="skeleton-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-shimmer" />
          <div className="skeleton-line skeleton-line-medium skeleton-shimmer" />
        </div>
        <div className="skeleton-line skeleton-line-short skeleton-shimmer mt-auto" />
      </div>
    </div>
  );
}
