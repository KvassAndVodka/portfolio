import type { ComponentPropsWithoutRef } from "react";

// The page header owns the only h1, so a top-level heading in body content
// renders as h2 to keep one h1 per page and an unbroken heading outline.
export const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h2">) => <h2 {...props} />,
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => <img alt={alt ?? ""} loading="lazy" decoding="async" {...props} />,
};
