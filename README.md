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
- Dictionary builder at `/app`
- APIs: `/api/extract`, `/api/build`, `/api/generate`
- Downloads Kindle source ZIP (open `dict.opf` in Kindle Previewer → export `.mobi`)

## Phase 2: Railway worker

When `COMPILE_WORKER_URL` is set on Vercel, `/api/generate` returns `.mobi` directly.

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

Project name suggestion: `kindledict`

Set **Root Directory** to `web` if linking from repo root in Vercel dashboard.

### 3. Environment variables

In [Vercel Dashboard](https://vercel.com/alalei719s-projects) → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | For chapter extraction |
| `OPENAI_CHAT_MODEL` | No | Default `gpt-4o-mini` |
| `COMPILE_WORKER_URL` | No | Railway worker URL (Phase 2) |
| `COMPILE_WORKER_SECRET` | No | Must match worker |

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

Open http://localhost:3000

## Important notes

- **Vercel Pro recommended** for `/api/generate` — Hobby plan limits functions to 10s; LLM extraction needs up to 300s (Pro).
- **Privacy**: Chapter text is sent to OpenAI for extraction; not persisted by this app.
- **Copyright**: Personal study use only; no DRM bypass.

## CLI dictionary build (original)

```bash
python3 build_dictionary.py entries-ch04.json
# Open dist/entries-ch04/dict.opf in Kindle Previewer → Export .mobi
```
