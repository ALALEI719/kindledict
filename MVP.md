# KindleDict Public Beta Checklist

## Live app

- Landing: https://kindledict.vercel.app
- Builder: https://kindledict.vercel.app/app
- Privacy / Terms / Contact pages

## Public beta model (BYOK)

Hosted demo uses **Bring Your Own Key**:

1. Users pick a provider in `/app` (Gemini, DeepSeek, Moonshot, OpenAI, OpenRouter, custom)
2. Users click **Test & save key**
3. Key stays in browser localStorage; requests send it only when generating
4. You do **not** pay their AI usage

### Vercel env for public beta

| Variable | Value |
|----------|-------|
| `KINDLE_DICT_BYOK_REQUIRED` | `true` |

Do **not** set server-side `GOOGLE_GENERATIVE_AI_API_KEY` / `OPENAI_API_KEY` on the public beta project unless you want to subsidize usage.

Redeploy after changing env vars.

### Supported user providers

| Preset | Best for |
|--------|----------|
| Google Gemini | Free tier, no OpenAI account |
| DeepSeek | Domestic payment, low cost |
| Moonshot (Kimi) | Chinese OpenAI-compatible API |
| OpenAI | Official API |
| OpenRouter | One key, many models |
| Custom | Any OpenAI-compatible gateway |

## Self-host / internal testing (optional server AI)

If `KINDLE_DICT_BYOK_REQUIRED` is not `true`, you can still configure server keys:

### Option A — Google Gemini

| Variable | Value |
|----------|-------|
| `LLM_PROVIDER` | `google` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | your Gemini key |
| `GOOGLE_CHAT_MODEL` | `gemini-2.5-flash` |

### Option B — DeepSeek

| Variable | Value |
|----------|-------|
| `LLM_PROVIDER` | `openai-compatible` |
| `OPENAI_API_KEY` | your DeepSeek key |
| `OPENAI_COMPAT_BASE_URL` | `https://api.deepseek.com/v1` |
| `OPENAI_CHAT_MODEL` | `deepseek-chat` |
   - Redeploy after saving

2. **Vercel Pro (recommended)**
   - Hobby plan limits serverless functions to 10 seconds
   - Chapter extraction often needs 30–120 seconds

## MVP flow (working end-to-end)

```
Paste chapter OR upload DRM-free EPUB
  → pick chapter (if EPUB)
  → Preview entries OR Generate & download
  → ZIP with dict.opf + content.html
  → Kindle Previewer 3 → export .mobi
  → sideload to Kindle documents/dictionaries/
```

## Optional Phase 2

- Deploy `worker/` to Railway
- Set `COMPILE_WORKER_URL` + `COMPILE_WORKER_SECRET` on Vercel for direct `.mobi` download

## Try without your own book

Click **Try sample chapter** on `/app` — loads A Clash of Kings Ch. 4 excerpt.
