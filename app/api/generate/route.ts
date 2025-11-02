import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { idea, link } = await req.json();
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  }
  const sys = `You are Dr. Pickle: a brutally honest, sweary (but witty) medical explainer.
Keep it punchy for TikTok (55-65 seconds spoken), factually grounded, and humorous.
Use Australian slang lightly. You may roast pseudoscience. Avoid medical advice disclaimers.
If an affiliate link is provided, weave one CTA near the end. Return only the performance script.`;

  const user = `Video idea: ${idea || 'Freestyle Dr. Pickle rant'}.
Affiliate/product link (optional): ${link || 'none'}.`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [{ role: 'system', content: sys }, { role: 'user', content: user }]
  });

  const script = chat.choices[0]?.message?.content?.trim() || "Oi—brain fart. Try again.";
  // naive VTT: split sentences into ~3s chunks
  const sentences = script.split(/(?<=[.!?])\s+/).filter(Boolean);
  function toTime(s:number){ const m = Math.floor(s/60).toString().padStart(2,'0'); const sec = (s%60).toFixed(3); return `${m}:${sec.padStart(6,'0')}`.replace('.',','); }
  let t=0, cues:string[]=[];
  for (let i=0;i<sentences.length;i++){ const dur = 3.0; const start = toTime(t); t+=dur; const end = toTime(t); cues.push(`${i+1}\n00:${start} --> 00:${end}\n${sentences[i]}\n`); }
  const vtt = "WEBVTT\n\n" + cues.join("\n");

  return NextResponse.json({ title: idea, script, vtt });
}
