import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import type { BlogIndex, BlogPost } from '../../src/features/blog/types';

type SourcePost = Omit<BlogPost, 'href'> & {
  slug?: string;
  href?: string;
  draft?: boolean;
  example?: boolean;
};

// Read the authoring inputs, not the generated index or the page's query code.
// The manifest identifies which inputs the candidate was actually built from.
export function readBlogExpectations(root = process.cwd()) {
  const { mode } = JSON.parse(
    readFileSync(path.join(root, '.generated/blog-input.json'), 'utf8'),
  );
  const source: 'mock' | 'content' = mode.blogSource ?? 'content';
  const requested = process.env.TEST_BLOG_SOURCE;
  if (requested && requested !== source)
    throw new Error(
      `TEST_BLOG_SOURCE=${requested}, candidate source=${source}`,
    );
  const mock = source === 'mock';
  const config = JSON.parse(
    readFileSync(
      path.join(
        root,
        mock ? 'tests/fixtures/blog/config.json' : 'content/pages/blog.json',
      ),
      'utf8',
    ),
  ) as Omit<BlogIndex, 'posts' | 'preview'>;
  const directory = path.join(
    root,
    mock ? 'tests/fixtures/blog/posts' : 'content/blog',
  );
  const all = readdirSync(directory).map((id) => {
    const raw = readFileSync(path.join(directory, id, 'index.md'), 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw);
    if (!match) throw new Error(`Missing frontmatter: ${id}`);
    const meta = parseDocument(match[1]).toJS() as SourcePost;
    return {
      ...meta,
      tagIds: meta.tagIds ?? [],
      technicalKeywords: meta.technicalKeywords ?? [],
      pullRequestRefs: meta.pullRequestRefs ?? [],
      href: meta.kind === 'internal' ? `/blog/${meta.slug}` : meta.href!,
    };
  });
  const posts = all
    .filter(
      (post) =>
        !post.draft &&
        !(
          !mock &&
          mode.target === 'release' &&
          !mode.publishExamples &&
          post.example
        ),
    )
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id),
    );
  const featuredId = posts.some((post) => post.id === config.featuredId)
    ? config.featuredId
    : undefined;
  return {
    ...config,
    source,
    posts,
    featuredId,
    excluded: all.filter((post) => !posts.includes(post)),
  };
}

export type BlogExpectations = ReturnType<typeof readBlogExpectations>;

export function expectedBlogList(
  blog: BlogExpectations,
  query: { category?: string; tag?: string; q?: string; page?: number } = {},
) {
  const matches = blog.posts.filter((post) => {
    if (query.category && post.categoryId !== query.category) return false;
    if (query.tag && !post.tagIds.includes(query.tag)) return false;
    if (!query.q) return true;
    const text = [
      post.title,
      post.summary,
      post.author ?? '',
      ...(post.technicalKeywords ?? []),
      ...(post.tagIds ?? []).map(
        (id) => blog.tags.find((tag) => tag.id === id)?.label ?? '',
      ),
      ...(post.pullRequestRefs ?? []).flatMap((ref) => [
        String(ref.number),
        `#${ref.number}`,
        `${ref.repository}#${ref.number}`,
      ]),
    ];
    return text.some((value) =>
      value.toLowerCase().includes(query.q!.toLowerCase()),
    );
  });
  const pages = Math.max(1, Math.ceil(matches.length / 12));
  const page = Math.min(query.page ?? 1, pages);
  return { posts: matches.slice((page - 1) * 12, page * 12), pages };
}
