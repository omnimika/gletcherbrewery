import { BlogLatestPosts } from "@/components/blog/blog-latest-posts";
import type { BlogListCard } from "@/content/blog";

type HomeBlogProps = {
  title: string;
  items: BlogListCard[];
};

/**
 * Home `#blog` — latest 4 posts via `BlogLatestPosts`.
 * DS-3: off HomeWindowStage (SectionFrame + proximity snap).
 * Design source: Tilda page 17104885 `#rec277882204` + `#rec277844567`.
 */
export function HomeBlog({ title, items }: HomeBlogProps) {
  return <BlogLatestPosts id="blog" title={title} items={items} snap />;
}
