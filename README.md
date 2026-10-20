# AI Knowledge Workspace

A Next.js frontend for asking questions against your documents. Chat requests go through this app’s server route, and the Dify API key stays on the server.

## Getting started

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `DIFY_API_BASE_URL` and `DIFY_API_KEY` in `.env.local`. Next.js loads environment files from the project root, not from `src/`.

## Project structure

```text
ai-knowledge-workspace/
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/                  Next.js pages and server routes
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── documents/page.tsx
│   │   ├── chat/[id]/page.tsx
│   │   └── api/chat/route.ts Secure forwarder to Dify
│   ├── components/           Reusable UI
│   ├── features/             Feature-specific logic
│   ├── hooks/
│   ├── lib/
│   │   ├── api-client.ts     Browser client for /api/chat
│   │   ├── dify.ts           Server-side Dify integration
│   │   └── utils.ts
│   ├── types/
│   └── styles/
├── tests/
└── .env.example
```

`components/` is reusable interface. `features/` is behavior for documents, conversations, and citations. `lib/dify.ts` is imported only by the server. The browser uses `lib/api-client.ts`, which calls `/api/chat`.
