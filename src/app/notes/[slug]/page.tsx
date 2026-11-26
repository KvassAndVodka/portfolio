import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

import { markdownComponents } from "@/components/markdownComponents";
import SiteFooter from "@/components/SiteFooter";
import { canonicalPostPath, getPost, getPosts } from "@/lib/posts";
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, defaultSocialImage, serializeJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Readonly<{ params: Params }>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Note not found",
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: post.title,
    description: post.summary,
    // A case study shown as a note points search engines at its project page, so the two never compete.
    path: canonicalPostPath(post),
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function NotePage({ params }: Readonly<{ params: Params }>) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);

  if (!post) notFound();

  const pad = (value: number) => String(value).padStart(2, "0");
  // The same number the note has in the log: counted from the first note, newest last.
  const currentIndex = posts.findIndex((entry) => entry.slug === post.slug);
  const number = posts.length - currentIndex;
  const newerNote = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const olderNote = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  const noteUrl = absoluteUrl(canonicalPostPath(post));
  const noteJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${noteUrl}#article`,
    url: noteUrl,
    mainEntityOfPage: noteUrl,
    headline: post.title,
    description: post.summary,
    image: absoluteUrl(defaultSocialImage.url),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "en",
    author: { "@id": absoluteUrl("/#person") },
    publisher: { "@id": absoluteUrl("/#person") },
    isPartOf: { "@id": absoluteUrl("/#website") },
    articleSection: post.category || undefined,
  };

  return (
    <>
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(noteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              // Same trail as the canonical page, so a case study's breadcrumbs agree with its canonical URL.
              breadcrumbJsonLd(
                post.isProject
                  ? [
                      { name: "Projects", path: "/projects" },
                      { name: post.title, path: canonicalPostPath(post) },
                    ]
                  : [
                      { name: "Notes", path: "/notes" },
                      { name: post.title, path: canonicalPostPath(post) },
                    ],
              ),
            ),
          }}
        />
        <header className="subpage-hero">
          <div className="site-shell max-w-5xl">
            <Link className="back-link mb-12" href="/notes">
              <FaArrowLeft aria-hidden="true" />
              All notes
            </Link>
            <p className="page-head-labels">
              {number <= posts.length && <span>No. {pad(number)}</span>}
              {post.category && <span>{post.category}</span>}
              <time dateTime={post.publishedAt}>{format(new Date(post.publishedAt), "d MMM yyyy")}</time>
              <span>{post.readTime}</span>
            </p>
            <h1 className="page-title !max-w-[15ch]">
              {post.title}
              <span className="title-dot">.</span>
            </h1>
            <p className="body-large mt-7">{post.summary}</p>
          </div>
        </header>

        <div className="site-shell max-w-5xl pb-20 md:pb-28">
          <div className="paper-sheet">
            <div className="prose prose-lg article-prose max-w-none">
              <MDXRemote source={post.content} components={markdownComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [[rehypeHighlight, { detect: true }]] } }} />
            </div>
          </div>

          <nav className="detail-footer-nav" aria-label="Note navigation">
            <div className="detail-footer-actions">
              <Link className="back-link" href="/notes">
                <FaArrowLeft aria-hidden="true" />
                All notes
              </Link>
              <Link className="postcard-button" href="/#contact">
                Get in touch
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            {(newerNote || olderNote) && (
              <div className="detail-pager">
                {newerNote ? (
                  <Link className="detail-pager-link" href={`/notes/${newerNote.slug}`}>
                    <span className="detail-pager-label">
                      <FaArrowLeft aria-hidden="true" />
                      Newer note
                    </span>
                    <span className="detail-pager-title">
                      {newerNote.title}
                      <span className="title-dot">.</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {olderNote && (
                  <Link className="detail-pager-link detail-pager-next" href={`/notes/${olderNote.slug}`}>
                    <span className="detail-pager-label">
                      Older note
                      <FaArrowRight aria-hidden="true" />
                    </span>
                    <span className="detail-pager-title">
                      {olderNote.title}
                      <span className="title-dot">.</span>
                    </span>
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
