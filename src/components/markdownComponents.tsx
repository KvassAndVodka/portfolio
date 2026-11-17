import type { ComponentPropsWithoutRef } from "react";
import type { ExtraProps } from "react-markdown";

import FigureVideo from "@/components/FigureVideo";
import { isVideoSrc } from "@/lib/media";

// The page header owns the only h1, so a top-level heading in body content
// renders as h2 to keep one h1 per page and an unbroken heading outline.
export const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h2">) => <h2 {...props} />,
  // An image alone in its paragraph is a figure: an atlas plate with a numbered strip.
  // Its markdown title (`![alt](src "caption")`) becomes the caption.
  p: ({ node, children, ...props }: ComponentPropsWithoutRef<"p"> & ExtraProps) => {
    const only = node?.children.length === 1 ? node.children[0] : null;
    if (only?.type !== "element" || only.tagName !== "img") return <p {...props}>{children}</p>;
    const { src, alt, title } = only.properties;
    const label = alt ? String(alt) : "";
    return (
      <figure className="article-figure">
        <figcaption className="article-figure-strip">
          <span className="article-figure-number" aria-hidden="true" />
          {title ? <span className="article-figure-caption">{String(title)}</span> : null}
        </figcaption>
        {isVideoSrc(String(src)) ? (
          <FigureVideo src={String(src)} label={label} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(src)} alt={label} loading="lazy" decoding="async" />
        )}
      </figure>
    );
  },
  // `node` is pulled out so it never reaches the DOM.
  // eslint-disable-next-line @next/next/no-img-element, @typescript-eslint/no-unused-vars
  img: ({ node: _node, alt, ...props }: ComponentPropsWithoutRef<"img"> & ExtraProps) => <img alt={alt ?? ""} loading="lazy" decoding="async" {...props} />,
};
