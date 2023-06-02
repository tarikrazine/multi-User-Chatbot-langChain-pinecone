import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { CallbackManager } from "langchain/callbacks";

import { supabaseClient } from "@/utils/supabase";
import { ConversationLog } from "@/utils/conversationLog";
import { templates } from "@/utils/templates";
import { getMatchesFromEmbeddings } from "@/utils/matches";
import initPinecone from "@/utils/pinecone-client";
import { summarizeLongDocument } from "@/utils/summarizer";

export const runtime = "edge";

const bodySchema = z.object({
  question: z.string({
    required_error: "Please ask a question",
  }),
});

type BodyInput = z.infer<typeof bodySchema>;

export async function POST(request: NextRequest) {
  const { userId, getToken } = auth();

  const token = await getToken({ template: "supabase" });

  if (!token) {
    return NextResponse.json("Not authorized.", { status: 404 });
  }

  const body = (await request.json()) as BodyInput;

  let parseData;

  try {
    parseData = bodySchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorInput = error.issues.map((e) => ({
        path: e.path[0],
        message: e.message,
      }));

      return NextResponse.json({ errorInput }, { status: 400 });
    }
  }

  const { question } = parseData as BodyInput;

  const supabase = await supabaseClient(token);

  // Retrieve the conversation log and save the user's prompt
  const conversationLog = new ConversationLog(supabase);

  let conversationHistory: void | String | string[];

  try {
    conversationHistory = await conversationLog.getConversation({
      limit: 10,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }

  try {
    await conversationLog.addEntry({
      entry: question,
      speaker: "user",
      userId: userId!,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }

  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

  const inquiryChain = new LLMChain({
    llm,
    prompt: new PromptTemplate({
      template: templates.inquiryTemplate,
      inputVariables: ["userPrompt", "conversationHistory"],
    }),
    verbose: true,
  });

  const inquiryChainResult = await inquiryChain.call({
    userPrompt: question,
    conversationHistory: conversationHistory,
  });

  const inquiry = inquiryChainResult.text;

  const embedder = new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002",
  });

  const embeddings = await embedder.embedQuery(inquiry);

  const pinecone = await initPinecone();

  const matches = await getMatchesFromEmbeddings(embeddings, pinecone, 3);

  interface Metadata {
    loc: string;
    pageContent: string;
    txtPath: string;
  }

  const docs = matches && Array.from(
    matches.reduce((map, match) => {
      const metadata = match.metadata as Metadata;
      const { pageContent, loc } = metadata;
      if (!map.has(loc)) {
        map.set(loc, pageContent);
      }
      return map;
    }, new Map()),
  ).map(([_, text]) => text);

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const chat = new ChatOpenAI({
    streaming: true,
    verbose: true,
    modelName: "gpt-3.5-turbo",
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token) {
        await writer.ready;
        await writer.write(encoder.encode(`data: ${token}\n\n`));
      },
      async handleLLMEnd(result) {
        await writer.ready;
        await writer.close();

        const textResponse = result.generations[0].map((res) => res.text);

        await conversationLog.addEntry({
          entry: textResponse[0],
          speaker: "ai",
          userId: userId!,
        });
      },
      handleLLMError: async (e) => {
        await writer.ready;
        await writer.abort(e);
      },
    }),
  });

  const chain = new LLMChain({
    prompt: new PromptTemplate({
      template: templates.qaTemplate,
      inputVariables: ["summaries", "question", "conversationHistory"],
    }),
    llm: chat,
    verbose: true,
  });

  const allDocs = docs.join("\n");

  if (allDocs.length > 4000) {
    console.log(`Just a second, forming final answer...`);
  }

  const summary = allDocs.length > 4000
    ? await summarizeLongDocument({ document: allDocs, inquiry })
    : allDocs;

  chain.call({
    summaries: summary,
    question: inquiry,
    conversationHistory,
  }).catch((e) => console.error(e));

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
