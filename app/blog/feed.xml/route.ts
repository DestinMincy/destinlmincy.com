import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export async function GET() {
  const posts = await getAllPosts();

  const items = posts
    .map((post) => {
      const pubDate = new Date(post.date + "T12:00:00").toUTCString();
      const url = `${site.url}/blog/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${(post.tags ?? []).map((tag) => `<category><![CDATA[${tag}]]></category>`).join("\n      ")}
    </item>`.trim();
    })
    .join("\n  ");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[DLM Agency Blog]]></title>
    <link>${site.url}</link>
    <description><![CDATA[Writing from ${site.name} on AI agents, software, and building for small business.]]></description>
    <language>en-us</language>
    <atom:link href="${site.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
