# KindleDict — Hybrid Vercel Architecture

Custom Kindle companion dictionaries (fictionary) built from chapter text.

## Repository layout

```
KindleDict/
├── web/                  # Next.js app → deploy to Vercel (alalei719s-projects)
├── worker/               # kindlegen compile service → deploy to Railway/Fly
├── build_dictionary.py   # Original Python builder (CLI)
├── entries-ch04.json     # Sample entries
└── website/index.html    # Original static landing (superseded by web/)
```

## Phase 1 (current): Vercel web app

- Landing page at `/`
- Dictionary builder at `/app` — **paste chapter or upload DRM-free EPUB**
- APIs: `/api/extract`, `/api/build`, `/api/generate`, `/api/parse-epub`, `/api/health`
- Downloads `.mobi` directly when `COMPILE_WORKER_URL` is configured
- Falls back to Kindle source ZIP (open `dict.opf` in Kindle Previewer → export `.mobi`)
- Sample chapter demo at `/app?sample=1` (`/samples/acok-ch04.txt`)
- Homepage pricing section can point to a paid beta checkout link

See [MVP.md](./MVP.md) for launch checklist.

## Compile worker

When `COMPILE_WORKER_URL` is set on Vercel, `/api/build` and `/api/generate`
return `.mobi` directly. If the worker is unavailable, the app falls back to
ZIP unless `COMPILE_WORKER_FALLBACK_ZIP=false`.

### Deploy worker to Railway

1. Create a new Railway project from `worker/` directory
2. Set env var `COMPILE_WORKER_SECRET` (random string)
3. Copy the public URL → set `COMPILE_WORKER_URL` on Vercel
4. Set the same `COMPILE_WORKER_SECRET` on Vercel

## Deploy to Vercel (alalei719s-projects)

### 1. Install CLI & login

```bash
npm i -g vercel
vercel login
```

### 2. Link project (first time)

```bash
cd web
vercel link
```

Choose scope: **alalei719s-projects**

Project name: **kindledict** (production URL: `https://kindledict.vercel.app` after rename)

Set **Root Directory** to `web` if linking from repo root in Vercel dashboard.

### 3. Environment variables

In [Vercel Dashboard](https://vercel.com/alalei719s-projects/kindledict) → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | For chapter extraction |
| `OPENAI_CHAT_MODEL` | No | Default `gpt-4o-mini` |
| `COMPILE_WORKER_URL` | No | Railway worker URL (Phase 2) |
| `COMPILE_WORKER_SECRET` | No | Must match worker |
| `KINDLE_DICT_BYOK_REQUIRED` | No | Set `false` for hosted AI generation; `true` for BYOK demos |
| `NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL` | No | Paid beta checkout/payment link shown on pricing card |

Or via CLI:

```bash
cd web
vercel env add OPENAI_API_KEY
```

### 4. Deploy

```bash
cd web
vercel --prod
```

Preview deploy (no `--prod`):

```bash
vercel
```

### 5. Custom domain (optional)

Point `kindledict.com` to the Vercel project in Domains settings.

## Local development

```bash
cd web
cp .env.example .env.local
# Edit .env.local — add OPENAI_API_KEY

npm run dev
```

Open https://kindledict.vercel.app or http://localhost:3000

## Important notes

- **Vercel Pro recommended** for `/api/generate` — Hobby plan limits functions to 10s; LLM extraction needs up to 300s (Pro).
- **Privacy**: Chapter text is sent to OpenAI for extraction; not persisted by this app.
- **Copyright**: Personal study use only; no DRM bypass.

## CLI dictionary build (original)

```bash
python3 build_dictionary.py entries-ch04.json
# Open dist/entries-ch04/dict.opf in Kindle Previewer → Export .mobi
```
