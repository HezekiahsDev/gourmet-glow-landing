import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Self-hosted variable fonts (latin subset) so builds never depend on Google Fonts.
const sans = localFont({
  src: [{ path: './fonts/dm-sans.woff2', weight: '400 700', style: 'normal' }],
  variable: '--font-sans',
  display: 'swap',
});
const serif = localFont({
  src: [
    { path: './fonts/playfair.woff2', weight: '400 600', style: 'normal' },
    { path: './fonts/playfair-italic.woff2', weight: '400 600', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Gourmet Glow | Nigerian Skin & Hair Care, Thoughtfully Crafted',
  description: 'Premium skin and hair care made with pure Nigerian shea butter, cocoa butter and baobab. Join the founding list for first access to our launch.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Gourmet Glow | Nature’s goodness. Thoughtfully crafted.',
    description: 'Nigerian-made skin & hair care is launching soon. Join the founding list for first access.',
    images: ['/images/hero.jpg'],
    type: 'website',
  },
};

export const viewport: Viewport = { themeColor: '#4A3027', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
