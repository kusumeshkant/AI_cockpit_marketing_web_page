import type { MetadataRoute } from 'next';
import { LEGAL_PATHS } from '@/content/legal';
import { NOINDEX } from '@/content/site';

/**
 * Generated at build time into `/robots.txt`.
 *
 * Staging builds (`NEXT_PUBLIC_NOINDEX=true`) disallow everything so the
 * temporary subdomain never competes with the real domain in search results,
 * except the legal pages, which Play Console links to and must stay reachable
 * by crawlers (the longer Allow rule wins over Disallow: /).
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) {
    return { rules: { userAgent: '*', allow: [...LEGAL_PATHS], disallow: '/' } };
  }
  return { rules: { userAgent: '*', allow: '/' } };
}
