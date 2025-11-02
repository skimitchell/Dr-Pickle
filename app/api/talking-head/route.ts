import { NextRequest, NextResponse } from 'next/server';

const DID_API = 'https://api.d-id.com/v1/talks';

export async function POST(req: NextRequest) {
  const { audioUrl } = await req.json();
  if (!process.env.DID_API_KEY) return NextResponse.json({ error: 'Missing DID_API_KEY' }, { status: 500 });
  if (!process.env.DID_SOURCE_IMAGE_URL) return NextResponse.json({ error: 'Missing DID_SOURCE_IMAGE_URL' }, { status: 500 });

  const payload = {
    source_url: process.env.DID_SOURCE_IMAGE_URL,
    audio_url: audioUrl,
    config: {
      stitch: true,
      background: 'transparent',
      result_format: 'mp4'
    }
  };

  const res = await fetch(DID_API, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY + ':').toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) return NextResponse.json({ error: 'D‑ID create failed', details: json }, { status: 500 });
  return NextResponse.json({ id: json.id });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (!process.env.DID_API_KEY) return NextResponse.json({ error: 'Missing DID_API_KEY' }, { status: 500 });

  const res = await fetch(`${DID_API}/${id}`, {
    headers: { 'Authorization': `Basic ${Buffer.from(process.env.DID_API_KEY + ':').toString('base64')}` }
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json({ status: 'error', message: JSON.stringify(json) }, { status: 500 });

  if (json.status === 'done') return NextResponse.json({ status: 'done', resultUrl: json.result_url });
  if (json.status === 'error') return NextResponse.json({ status: 'error', message: json.error?.message || 'Unknown error' }, { status: 200 });

  return NextResponse.json({ status: json.status, progress: json?.metadata?.progress || '' });
}
