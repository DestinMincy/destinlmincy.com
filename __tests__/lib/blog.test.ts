import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/blog";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

function markdownFilesOnDisk(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

test("getPostSlugs returns a slug for every markdown file in content/blog", () => {
  const slugs = getPostSlugs();
  const expected = markdownFilesOnDisk();

  assert.ok(expected.length > 0, "fixture check: content/blog has posts");
  assert.deepEqual([...slugs].sort(), [...expected].sort());
});

test("getPostSlugs strips the .md extension", () => {
  for (const slug of getPostSlugs()) {
    assert.ok(!slug.endsWith(".md"), `${slug} should not carry an extension`);
    assert.ok(
      fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`)),
      `${slug}.md should exist on disk`,
    );
  }
});

test("getPostBySlug returns null for an invalid slug", async () => {
  assert.equal(await getPostBySlug("no-such-post"), null);
});

test("getPostBySlug refuses slugs that walk out of content/blog", async () => {
  // README.md really does exist at the repo root, so an unguarded
  // path.join would happily read it.
  assert.ok(fs.existsSync(path.join(process.cwd(), "README.md")));

  assert.equal(await getPostBySlug("../../README"), null);
  assert.equal(await getPostBySlug("../README"), null);
  assert.equal(await getPostBySlug("../../package"), null);
  assert.equal(await getPostBySlug("/etc/passwd"), null);
  assert.equal(await getPostBySlug(""), null);
});

test("getPostBySlug still accepts the real kebab-case slugs", async () => {
  for (const slug of getPostSlugs()) {
    assert.ok(await getPostBySlug(slug), `${slug} should still resolve`);
  }
});

test("getPostBySlug returns parsed frontmatter and rendered html", async () => {
  const [slug] = getPostSlugs();
  const post = await getPostBySlug(slug);

  assert.ok(post, "post should be found");
  assert.equal(post.slug, slug);
  assert.equal(typeof post.title, "string");
  assert.ok(post.title.length > 0);
  assert.equal(typeof post.description, "string");
  assert.ok(post.description.length > 0);
  assert.match(post.date, /^\d{4}-\d{2}-\d{2}/);
  assert.ok(post.contentHtml && post.contentHtml.includes("<"));
  assert.ok(
    !post.contentHtml.includes("---\ntitle:"),
    "frontmatter should be stripped from the rendered html",
  );
});

test("getAllPosts returns every post", async () => {
  const posts = await getAllPosts();
  assert.equal(posts.length, getPostSlugs().length);
});

test("getAllPosts returns a sorted array, newest first", async () => {
  const posts = await getAllPosts();
  assert.ok(posts.length > 1, "fixture check: needs more than one post to sort");

  const dates = posts.map((post) => post.date);
  const newestFirst = [...dates].sort((a, b) => (a > b ? -1 : 1));

  assert.deepEqual(dates, newestFirst);

  for (let i = 1; i < dates.length; i += 1) {
    assert.ok(
      dates[i - 1] >= dates[i],
      `${dates[i - 1]} should not sort after ${dates[i]}`,
    );
  }
});
