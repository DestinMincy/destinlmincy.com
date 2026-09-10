import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/blog";
import { site } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

const postDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container section section--tight">
      <nav aria-label="Breadcrumb" style={{ marginBottom: "32px" }}>
        <Link className="admin-breadcrumb" href="/blog">
          Notes
        </Link>
      </nav>

      <article className="blog-post">
        <header className="blog-post__header">
          <time
            className="blog-list__date"
            dateTime={post.date}
          >
            {postDateFormatter.format(new Date(post.date + "T12:00:00"))}
          </time>
          <h1 className="blog-post__title">{post.title}</h1>
          <p className="blog-post__desc">{post.description}</p>
          {post.tags && post.tags.length > 0 ? (
            <ul className="blog-tag-list" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className="blog-tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div
          className="blog-post__body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml ?? "" }}
        />
      </article>
    </div>
  );
}

// Satisfy Next.js for dynamic params not in generateStaticParams at runtime
export const dynamicParams = true;
