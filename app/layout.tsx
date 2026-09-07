import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Aero — Somewhere better', description: 'A little corner of the internet where the skies are blue, fish float by, and the future still feels like a daydream. An immersive Frutiger Aero experience.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
