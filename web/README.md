# KindleDict Web

Next.js app for KindleDict landing pages, EPUB parsing, AI extraction, and
dictionary downloads.

## P0 Runtime

Production on Vercel currently uses hosted Gemini generation:

```bash
KINDLE_DICT_BYOK_REQUIRED=false
GOOGLE_GENERATIVE_AI_API_KEY=...
# Optional — auto-detected when omitted:
# LLM_PROVIDER=google
# GOOGLE_CHAT_MODEL=gemini-2.5-flash
```

Add when ready:

```bash
COMPILE_WORKER_URL=...
COMPILE_WORKER_SECRET=...
NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL=...
```

With `COMPILE_WORKER_URL` set, `/api/build` returns a Kindle `.mobi` file.
Without it, the app falls back to a ZIP containing `dict.opf` and source HTML.

## Sync env from Vercel

```bash
vercel link
vercel env pull .env.local --environment=production --yes
```

This writes secrets to `.env.local` (gitignored). Use `.env.example` as the committed template for GitHub.

## Local Development

```bash
npm install
cp .env.example .env.local   # or vercel env pull (see above)
npm run dev
```

Open `http://localhost:3000/app?sample=1` to load the bundled sample chapter.

## Checks

```bash
npm run lint
npm run build
```
