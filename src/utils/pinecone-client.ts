import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "@/config/env.mjs";

export default async function initPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT, //this is in the dashboard
    });

    return pinecone;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}
