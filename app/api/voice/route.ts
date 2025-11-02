import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Brian

  if (!apiKey) return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });

  const tts = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true },
      output_format: 'mp3_44100_128'
    })
  });

  if (!tts.ok) {
    const err = await tts.text();
    return NextResponse.json({ error: 'TTS failed', details: err }, { status: 500 });
  }

  const audioBuffer = Buffer.from(await tts.arrayBuffer());
  // Upload to Vercel Blob (public) so D‑ID can fetch it
  const blobName = `audio/${Date.now()}-drpickle.mp3`;
  const { url } = await put(blobName, audioBuffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: 'audio/mpeg'
  });

  return NextResponse.json({ audioUrl: url });
}
