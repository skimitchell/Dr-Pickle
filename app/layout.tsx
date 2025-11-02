import './globals.css';
import Image from 'next/image';

export const metadata = {
  title: "Dr. Pickle's TikTok Video Generator",
  description: "Brutally honest medical takes with AI voice + talking head video."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="h1"><Image src="/logo.svg" alt="logo" width={200} height={60} /> </div>
          {children}
          <div className="footer"><small className="mono">Built for Nicole • Vercel + ElevenLabs + D‑ID</small></div>
        </div>
      </body>
    </html>
  );
}
