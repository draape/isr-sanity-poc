import { NextPage } from "next";
import { sanityClient } from "lib/sanity-client";
import { groq } from "next-sanity";

interface ArticlePageProps {
  article: any;
}

const ArticlePage: NextPage<ArticlePageProps> = ({ article }) => {
  return (
    <div>
      <h1>Tittel: {article.title}</h1>
    </div>
  );
};

const query = groq`*[_type == "article" && slug.current == $slug][0]{
  title,
  description,
  author,
  updatedAt,
  slug,
  image {
    ...,
    "title": asset->title,
    "altText": asset->altText,
    "description": asset->description,
  }
}`;

export async function getStaticPaths() {
  return {
    paths: ["test"].map((slug: string) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps(_: any) {
  // touch
  const article = await sanityClient.fetch(query, { slug: "testartikkel" });
  return {
    props: {
      article,
    },
  };
}

export default ArticlePage;
