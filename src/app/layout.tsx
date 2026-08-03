import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Olin Prompt List | Minimalist AI Art & Prompt Discovery',
  description: 'A clean, visual-first marketplace for discovering, sharing, and copying high-fidelity AI image prompts for Midjourney, Flux, and DALL-E.',
  keywords: 'AI prompts, Midjourney V6, Flux.1, DALL-E 3, Stable Diffusion, prompt marketplace, minimal AI discovery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Instant theme hydration script to prevent flash or default reset */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('olin_theme');
                  if (savedTheme === 'light' || savedTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <footer style={{
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Olin Prompt List</strong> &copy; {new Date().getFullYear()}. Minimalist AI Art Discovery.
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a>
                  <a href="/saved" style={{ color: 'inherit', textDecoration: 'none' }}>Saved</a>
                  <a href="/following" style={{ color: 'inherit', textDecoration: 'none' }}>Following</a>
                  <a href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</a>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
