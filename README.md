# Dr. Pickle's TikTok Video Generator

Vercel-ready Next.js app that:
- Writes a spicy 60s script (OpenAI)
- Synthesizes Brian (ElevenLabs) voice
- Uploads audio to Vercel Blob (public)
- Animates a talking head (D‑ID) and returns MP4
- Shows web subtitles (WebVTT track)

## Quick Start (Local)

```bash
pnpm i # or npm i
cp .env.sample .env.local
# fill keys
pnpm dev
```

## Deploy to Vercel

1. Create a New Project from this repo.
2. Add Environment Variables (Project Settings → Environment Variables):

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID` = `21m00Tcm4TlvDq8ikWAM` (Brian, confirm in your account)
- `DID_API_KEY`
- `DID_SOURCE_IMAGE_URL` – public PNG/JPG headshot for Dr Pickle
- `BLOB_READ_WRITE_TOKEN` – Vercel → Storage → Blob → “Create Token” (Read/Write)

3. Deploy. Done ✅

## Notes

- Subtitles are soft (WebVTT). If you later want burned-in captions, add an FFmpeg step server-side.
- If you prefer HeyGen instead of D‑ID, swap the `/api/talking-head` route to call their API.
- If you hit quotas, you can swap the `model` in `/api/generate` to a cheaper one.
