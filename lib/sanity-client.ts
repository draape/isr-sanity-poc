import { sanityConfig } from "./config";
import { createClient } from "next-sanity";

export const sanityClient = createClient(sanityConfig);
