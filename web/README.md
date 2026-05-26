# KindleDict Web

Next.js app for KindleDict landing pages, EPUB parsing, AI extraction, and
dictionary downloads.

## P0 Runtime

Use this setup for the commercial beta path:

```bash
KINDLE_DICT_BYOK_REQUIRED=false
LLM_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=...
GOOGLE_CHAT_MODEL=gemini-2.5-flash
COMPILE_WORKER_URL=...
COMPILE_WORKER_SECRET=...
NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL=...
```

With `COMPILE_WORKER_URL` set, `/api/build` returns a Kindle `.mobi` file.
Without it, the app falls back to a ZIP containing `dict.opf` and source HTML.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/app?sample=1` to load the bundled sample chapter.

## Checks

```bash
npm run lint
npm run build
```
