import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { NextApiRequest, NextApiResponse } from "next";
import { sanityClient } from "lib/sanity-client";
import groq from "groq";
import { apiErrorHandler } from "helpers/error-handler";
const secret = process.env.NEXT_PUBLIC_SANITY_STUDIO_REVALIDATE_SECRET || "";

async function readBody(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default apiErrorHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stringifiedRequest = await readBody(req);
  console.log("revalidate called", stringifiedRequest);

  if (req.method !== "POST") {
    return res.status(401).json({ message: "Method not allowed" });
  }

  if (!secret) {
    return res
      .status(500)
      .json({ message: "Missing sanity studio revalidate secret" });
  }

  const signature = req.headers[SIGNATURE_HEADER_NAME]?.toString() || "";

  if (!signature) {
    res.status(401).json({ message: `Missing signature` });
    return;
  }
  const SIGNATURE_HEADER_REGEX = /^t=(\d+)[, ]+v1=([^, ]+)$/;
  const [, timestamp, hashedPayload] =
    signature.trim().match(SIGNATURE_HEADER_REGEX) || [];
  if (!isValidSignature(stringifiedRequest, signature, secret.trim())) {
    if (!timestamp || !hashedPayload) {
      return res
        .status(401)
        .json({ message: `Invalid signature ${signature}` });
    }

    return res.status(401).json({ message: `Invalid request ` });
  }

  try {
    await res.revalidate("/test");
    return res.status(200).json({
      message: `Revalidate `,
      revalidate: true,
    });
    /*   const { _type, slug, category } = JSON.parse(stringifiedRequest);
      const slugByCategory = groq`*[_type == "category" && _id== $ref][0]{
                  "slug": parent->slug {
                      current
                  }
      }`;
      if (category && category._ref) {
        const fetchParentCategorySlug = await sanityClient.fetch(slugByCategory, {
          ref: category._ref,
        });
  
        if (
          fetchParentCategorySlug.slug &&
          fetchParentCategorySlug.slug.current
        ) {
          await res.revalidate(`/faq/${fetchParentCategorySlug.slug.current}`);
          return res.status(200).json({
            message: `Revalidate "${_type}" with slug ${fetchParentCategorySlug?.slug.current} ${stringifiedRequest}`,
            revalidate: true,
          });
        } else {
          return res.status(500).json({
            message: `Slug is null, can't revalidate ${_type} and slug ${fetchParentCategorySlug?.slug?.current} : slug: ${slug?.current}: query : ${fetchParentCategorySlug}: category: ${category?.title} : categoryslug: ${category?._ref}`,
          });
        }
      }
      switch (_type) {
        case 'category':
          await res.revalidate(`/faq`);
          return res.status(200).json({
            message: `Revalidate "${_type}" `,
            revalidate: true,
          });
        case 'article':
          await res.revalidate(`/${slug.current}`);
          await res.revalidate('/');
          return res.status(200).json({
            message: `Revalidate "${_type}" `,
            revalidate: true,
          });
      }
      return res.json({ message: `No revalidate for "${_type}"` }); */
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error cant revalidate. stringifiedRequest: ${stringifiedRequest}.  Error:  ${error}`,
    });
  }
});

// Next.js will by default parse the body, which can lead to invalid signatures
export const config = {
  api: {
    bodyParser: false,
  },
};
