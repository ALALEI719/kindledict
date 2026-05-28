# KindleDict Web

Next.js app for KindleDict landing pages, EPUB parsing, AI extraction, and
dictionary downloads.

## P0 Runtime

Production on Vercel currently uses hosted Gemini generation and the compile worker:

```bash
KINDLE_DICT_BYOK_REQUIRED=false
GOOGLE_GENERATIVE_AI_API_KEY=...
COMPILE_WORKER_URL=...              # Production + Preview
COMPILE_WORKER_SECRET=...           # Production + Preview
COMPILE_WORKER_FALLBACK_ZIP=...     # Production + Preview
# Optional — auto-detected when omitted:
# LLM_PROVIDER=google
# GOOGLE_CHAT_MODEL=gemini-2.5-flash
```

Add when ready:

```bash
KINDLE_DICT_TRIAL_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL=...
```

With Supabase configured, `/account` supports email magic-link sign-in and paid
access can follow the user across browsers. Run
[supabase/customer_access.sql](</Users/issuser/Library/Mobile%20Documents/com~apple~CloudDocs/KindleDict/supabase/customer_access.sql>)
in your Supabase SQL editor, then mark paid users as `active` in
`public.customer_access` until a payment webhook is connected.

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
