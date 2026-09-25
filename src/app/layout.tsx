import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { brand, faq, meta, NOINDEX, SITE_URL } from '@/content/site';
import { colors } from '@/styles/tokens';
import './globals.css';

/*
 * Fonts are self-hosted from `src/app/fonts` rather than fetched by
 * `next/font/google`. The Google loader downloads at build time, which fails
 * inside Turbopack's font pipeline on Linux CI and would put the same
 * dependency on the Cloudflare Pages build container. Run `npm run fonts` to
 * refresh the files; all three are variable, so one file covers each range.
 */

const archivo = localFont({
  src: './fonts/archivo.woff2',
  weight: '700 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
});

const plexSans = localFont({
  src: './fonts/ibm-plex-sans.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-plex-sans',
});

// Mono is only used for small labels, never for the LCP element, so it is
// fetched without competing for bandwidth with the headline font.
const plexMono = localFont({
  src: './fonts/ibm-plex-mono.woff2',
  weight: '600',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-plex-mono',
});

/**
 * Social-card image URLs must be absolute, so they are only emitted once the
 * site origin is known. Without `NEXT_PUBLIC_SITE_URL` the page still ships a
 * complete title/description card — it simply carries no canonical URL and no
 * image, rather than one resolved against a guessed or localhost origin.
 */
const ogImages = SITE_URL
  ? [{ url: meta.ogImage, width: 1200, height: 630, alt: brand.tagline }]
  : undefined;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL), alternates: { canonical: '/' } } : {}),
  title: meta.title,
  description: meta.description,
  applicationName: brand.name,
  openGraph: {
    type: 'website',
    ...(SITE_URL ? { url: SITE_URL } : {}),
    siteName: brand.name,
    title: meta.title,
    description: meta.description,
    ...(ogImages ? { images: ogImages } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    ...(SITE_URL ? { images: [meta.ogImage] } : {}),
  },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  // Staging builds set NEXT_PUBLIC_NOINDEX=true to stay out of search results.
  robots: NOINDEX ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: colors.bg,
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const softwareApplicationLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: brand.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS, Android',
  description: meta.description,
  ...(SITE_URL ? { url: SITE_URL } : {}),
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          // Static, author-controlled JSON-LD.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      </body>
    </html>
  );
}
