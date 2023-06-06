# Next.js Multi-User Chatbot with LangChainAI and Pinecone


[![Watch the video](https://i9.ytimg.com/vi_webp/hbFuBZ7LUZY/maxresdefault.webp?v=647d1366&sqp=CLTW_qMG&rs=AOn4CLCVUvFSiK-Hwocyw7rPk7MsYm8sjw)](https://youtu.be/hbFuBZ7LUZY)

### Credit to: **Roie Schwaber-Cohen** from Pinecone. Please check out this beautiful article: [Building a Multi-User Chatbot with Langchain and Pinecone in Next.JS](https://www.pinecone.io/learn/javascript-chatbot/)

## Services used in this app
- Pinecone
- Supabase
- clerk

# **Setup**
## 1. Clone this repository
```
git clone https://github.com/tarikrazine/multi-User-Chatbot-langChain-pinecone.git
```

## 2. Install dependencies
```
cd multi-User-Chatbot-langChain-pinecone
yarn
```

## 3. Move your .env.example to .env
```
mv .env.example .env
```

## 4. Pinecone store
- Assuming you already have a Pinecone Account, you will need the index name of your vectors data and your Pinecone API and Pinecone Environment.

## 5. Supabase
- Create an account
- Create a new project
- Add a new table named "conversations" with the following columns: user_id (type: text), entry (type: text), speaker (type: text)
    

## 6. Clerk
- Create an account
- Create a new project

## 7. Supabase and Clerk walkthrough
- To properly use Supabase and Clerk, this article will help you understand how these two services work together: [NextJS + Supabase + Clerk: Build a simple todo app with multifactor authentication](https://clerk.com/blog/nextjs-supabase-todos-with-multifactor-authentication)

## 8. Add your keys to the .env
```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## 9. Start the project
```
yarn dev
```

## 10. Deploy to vercel
```
Soon
```

### - **I'm thinking of rebuilding the UI very soon, so keep an eye out! 👀**