type AdminPageHeadProps = Readonly<{
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}>;

/** The top of every admin page: rust figure label, display title with the orange full stop, lead, actions. */
export default function AdminPageHead({ kicker, title, lead, children }: AdminPageHeadProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-10 pt-12 md:flex-row md:items-end md:justify-between md:pt-16">
      <div data-reveal>
        <p className="admin-label text-[var(--accent)]">{kicker}</p>
        <h1 className="admin-page-title mt-4">{title}</h1>
        {lead && <p className="site-muted mt-5 max-w-[42rem] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.7]">{lead}</p>}
      </div>
      {children && <div data-reveal className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
