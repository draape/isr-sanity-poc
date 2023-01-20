export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "";
export const apiVersion = "2022-11-15";
export const token = process.env.SANITY_API_TOKEN || "";
export const readToken = process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN || "";
export const previewSecret =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_SECRET || "";

export const sanityConfig = {
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion,
  useCdn: false,
  token: token,
};
