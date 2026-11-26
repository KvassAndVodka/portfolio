import { contourLevels } from "@/lib/contours";

// One hill off the right edge, so the rings read as the corner of a survey sheet behind the title.
const HILLS = [
  { x: 520, y: 150, height: 300, spread: 150, stretch: 1.3 },
  { x: 250, y: 330, height: 140, spread: 90 },
];
const TERRAIN = contourLevels(HILLS, { width: 640, height: 420, step: 22 });

type PageHeadProps = Readonly<{
  /** Mono labels over the title, e.g. the section name and a count. */
  labels: string[];
  title: string;
  lead: string;
}>;

/** The head of an index page: mono labels, the title with the orange full stop, the lead, and a contour corner. */
export default function PageHead({ labels, title, lead }: PageHeadProps) {
  return (
    <div className="page-head">
      <svg className="page-head-contours" viewBox="0 0 640 420" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
        {TERRAIN.map((level) => (
          <path className={level.index ? "is-index" : undefined} d={level.d} key={level.elevation} />
        ))}
      </svg>
      <div className="site-shell">
        <p className="page-head-labels">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </p>
        <h1 className="page-title">
          {title}
          <span className="title-dot">.</span>
        </h1>
        <p className="body-large mt-7">{lead}</p>
      </div>
    </div>
  );
}
