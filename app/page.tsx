'use client';
import { useEffect, useRef, useState } from 'react';

type ScriptOut = { title:string; script:string; vtt:string };

export default function Home() {
  const [idea, setIdea] = useState('e.g., A brief history of the rubber chicken');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [scriptOut, setScriptOut] = useState<ScriptOut | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  async function handleGenerate() {
    setBusy(true);
    setStatus('Writing Dr. Pickle script…');
    setVideoUrl('');
    setAudioUrl('');
    try {
      const sres = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ idea, link }) });
      if (!sres.ok) throw new Error('script error');
      const sjson: ScriptOut = await sres.json();
      setScriptOut(sjson);

      setStatus('Synthesizing Brian voice…');
      const vres = await fetch('/api/voice', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: sjson.script }) });
      if (!vres.ok) throw new Error('voice error');
      const { audioUrl: aurl } = await vres.json();
      setAudioUrl(aurl);

      setStatus('Animating talking head…');
      const create = await fetch('/api/talking-head', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ audioUrl: aurl }) });
      if (!create.ok) throw new Error('video create error');
      const { id } = await create.json();

      // poll for completion
      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 2500));
        const gres = await fetch(`/api/talking-head?id=${id}`);
        const gjson = await gres.json();
        if (gjson.status === 'done' && gjson.resultUrl) {
          setVideoUrl(gjson.resultUrl);
          done = true;
        } else if (gjson.status === 'error') {
          throw new Error(gjson.message || 'video generation failed');
        } else {
          setStatus(`Animating… ${gjson.progress || ''}`);
        }
      }
      setStatus('Complete ✅');
    } catch (e:any) {
      setStatus('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="badge">Video Idea</div>
        <textarea value={idea} onChange={e=>setIdea(e.target.value)} />
        <div style={{ height: 12 }} />
        <div className="badge">Affiliate Link URL (optional)</div>
        <input className="input" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://example.com/product" />
        <div style={{ height: 16 }} />
        <button className="button" onClick={handleGenerate} disabled={busy}>
          {busy ? 'Working…' : '→ Generate Video'}
        </button>
        <div style={{ height: 12 }} />
        <small className="mono">{status}</small>
        {scriptOut && (
          <details style={{marginTop:12}}>
            <summary>Show Script</summary>
            <pre style={{whiteSpace:'pre-wrap'}}>{scriptOut.script}</pre>
          </details>
        )}
      </div>
      <div className="card">
        {!videoUrl ? (
          <div className="videoBox">Your generated video will appear here.</div>
        ) : (
          <div>
            <video controls src={videoUrl} style={{width:'100%', borderRadius:12}}>
              {scriptOut?.vtt && <track default kind="subtitles" srcLang="en" label="English" src={`data:text/vtt;charset=utf-8,${encodeURIComponent(scriptOut.vtt)}`} />}
            </video>
            <div style={{marginTop:8}}>
              <a className="button" href={videoUrl} download>Download MP4</a>
              {audioUrl && <a className="button" style={{marginLeft:8}} href={audioUrl} target="_blank">Audio (MP3)</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
