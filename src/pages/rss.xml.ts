import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, slug }) => ({
      link: `posts/${slug}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
    stylesheet: "/rss.xsl",
    xmlns: {
      "itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"
    },
    customData:
      `<itunes:image href="https://cdn.jsdelivr.net/gh/bxb100/bxb100@master/png2.png" />`,
  });
}
