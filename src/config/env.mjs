import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string({
      required_error: "Missing Openai API key in .env file",
    }),
    PINECONE_API_KEY: z.string({
      required_error: "Missing Pinecone API key in .env file",
    }),
    PINECONE_ENVIRONMENT: z.string({
      required_error: "Missing Pinecone environment in .env file",
    }),
    PINECONE_INDEX_NAME: z.string({
      required_error: "Missing Pinecone index name in .env file",
    }),
  },
  client: {
    //NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  },
});