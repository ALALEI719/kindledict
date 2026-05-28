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
SUPABASE_SERVICE_ROLE_KEY=...
CREEM_API_KEY=...
CREEM_PRODUCT_ID=...
CREEM_WEBHOOK_SECRET=...
# Optional:
# CREEM_API_BASE_URL=https://test-api.creem.io
# CREEM_PLAN_SLUG=reader-access
```

With Supabase configured, `/account` supports email magic-link sign-in and paid
access can follow the user across browsers. Run
[supabase/customer_access.sql](</Users/issuser/Library/Mobile%20Documents/com~apple~CloudDocs/KindleDict/supabase/customer_access.sql>)
in your Supabase SQL editor.

With Creem configured, `/account` starts an authenticated checkout flow that
attaches the signed-in Supabase user id in `metadata.referenceId`, and
`/api/creem/webhook` syncs successful payments back into
`public.customer_access`.

Create a webhook in Creem that points to:

```bash
https://your-domain/api/creem/webhook
```

and use the webhook secret from Creem as `CREEM_WEBHOOK_SECRET`.

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
