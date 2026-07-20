import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FaArrowLeft } from "react-icons/fa6";

import { getPost, getPosts } from "@/lib/posts";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = true;

export default async function NotePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article>
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
