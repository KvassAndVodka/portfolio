import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FaArrowLeft } from "react-icons/fa6";

import { getPost, getPosts } from "@/lib/posts";
import { absoluteUrl, createPageMetadata, defaultSocialImage, serializeJsonLd } from "@/lib/seo";

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
    path: `/notes/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function NotePage({ params }: Readonly<{ params: Params }>) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const noteUrl = absoluteUrl(`/notes/${post.slug}`);
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
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(noteJsonLd) }}
      />
      <header className="subpage-hero">
        <div className="site-shell max-w-5xl">
          <Link className="back-link mb-12" href="/notes">
            <FaArrowLeft aria-hidden="true" />
            Back to notes
          </Link>
          {post.category && <p className="eyebrow mb-6">{post.category}</p>}
          <h1 className="page-title !max-w-[15ch]">{post.title}</h1>
          <div className="meta-list mt-8">
            <time dateTime={post.publishedAt}>
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </time>
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      <div className="site-shell max-w-3xl py-16 md:py-24">
        <div className="prose prose-lg article-prose max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </div>
    </article>
  );
}
