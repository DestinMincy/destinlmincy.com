import fs from "fs";
import path from "path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  contentHtml?: string;
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/**
 * Post slugs arrive from the URL, so they are untrusted input. Only plain
 * kebab/snake-case tokens are accepted: anything with a dot or separator
 * could otherwise walk out of `content/blog` and read arbitrary markdown.
 */
function isSafeSlug(slug: string): boolean {
  return /^[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*$/.test(slug);
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  if (!isSafeSlug(slug)) return null;

  const fullPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
    contentHtml,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const slugs = getPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return (posts.filter(Boolean) as BlogPost[]).sort((a, b) =>
    a.date > b.date ? -1 : 1,
  );
}
