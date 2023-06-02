const templates = {
  qaTemplate:
    `Answer the question based on the context below. You should follow ALL the following rules when generating and answer:
          - There will be a CONVERSATION LOG, CONTEXT, and a QUESTION.
          - The final answer must always be styled using markdown.
          - Your secondary goal is to provide the user with an answer that is relevant to the question.
          - Take into account the entire conversation so far, marked as CONVERSATION LOG, but prioritize the CONTEXT.
          - Based on the CONTEXT, choose the source that is most relevant to the QUESTION.
          - Do not make up any answers if the CONTEXT does not have relevant information.
          - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
          - Do not mention the CONTEXT or the CONVERSATION LOG in the answer, but use them to generate the answer.
          - ALWAYS prefer the result with the highest "score" value.
          - The answer should only be based on the CONTEXT. Do not use any external sources. Do not generate the response based on the question without clear reference to the context.
          - Summarize the CONTEXT to make it easier to read, but don't omit any information.
  
          CONVERSATION LOG: {conversationHistory}
  
          CONTEXT: {summaries}
  
          QUESTION: {question}
  
          Final Answer: `,
  summarizerTemplate:
    `Shorten the text in the CONTENT, attempting to answer the INQUIRY You should follow the following rules when generating the summary:
      - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
      - Code will be surrounded by backticks (\`) or triple backticks (\`\`\`).
      - Summary should include code examples that are relevant to the INQUIRY, based on the content. Do not make up any code examples on your own.
      - The summary will answer the INQUIRY. If it cannot be answered, the summary should be empty, AND NO TEXT SHOULD BE RETURNED IN THE FINAL ANSWER AT ALL.
      - If the INQUIRY cannot be answered, the final answer should be empty.
      - The summary should be under 4000 characters.
      - The summary should be 2000 characters long, if possible.
  
      INQUIRY: {inquiry}
      CONTENT: {document}
  
      Final answer:
      `,
  summarizerDocumentTemplate:
    `Summarize the text in the CONTENT. You should follow the following rules when generating the summary:
      - Any code found in the CONTENT should ALWAYS be preserved in the summary, unchanged.
      - Code will be surrounded by backticks (\`) or triple backticks (\`\`\`).
      - Summary should include code examples when possible. Do not make up any code examples on your own.
      - The summary should be under 4000 characters.
      - The summary should be at least 1500 characters long, if possible.
  
      CONTENT: {document}
  
      Final answer:
      `,
  inquiryTemplate:
    `Given the following user prompt and conversation log, formulate a question that would be the most relevant to provide the user with an answer from a knowledge base.
      You should follow the following rules when generating and answer:
      - Always prioritize the user prompt over the conversation log.
      - Ignore any conversation log that is not directly related to the user prompt.
      - Only attempt to answer if a question was posed.
      - The question should be a single sentence
      - You should remove any punctuation from the question
      - You should remove any words that are not relevant to the question
      - If you are unable to formulate a question, respond with the same USER PROMPT you got.
  
      USER PROMPT: {userPrompt}
  
      CONVERSATION LOG: {conversationHistory}
  
      Final answer:
      `,
  summerierTemplate:
    `Summarize the following text. You should follow the following rules when generating and answer:`,
};

export { templates };
