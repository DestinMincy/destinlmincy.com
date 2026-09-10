import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notes",
  description: `Writing from ${site.name} on AI agents, software, and building for small business.`,
  openGraph: {
    title: `Notes | ${site.name}`,
    description: `Writing from ${site.name} on AI agents, software, and building for small business.`,
    url: `${site.url}/blog`,
  },
  alternates: {
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

const postDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Notes</p>
          <h1>Writing</h1>
          <p className="lead">
            Thoughts on AI agents, software builds, and running a small
            technical agency.
          </p>
        </div>
      </div>

      <div className="container section section--tight">
        {posts.length === 0 ? (
          <p className="lead">No posts yet. Check back soon.</p>
        ) : (
          <ol className="blog-list">
            {posts.map((post) => (
              <li key={post.slug} className="blog-list__item">
                <time
                  className="blog-list__date"
                  dateTime={post.date}
                >
                  {postDateFormatter.format(new Date(post.date + "T12:00:00"))}
                </time>
                <h2 className="blog-list__title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="blog-list__desc">{post.description}</p>
                {post.tags && post.tags.length > 0 ? (
                  <ul className="blog-tag-list" aria-label="Tags">
                    {post.tags.map((tag) => (
                      <li key={tag} className="blog-tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
