import type { MetadataRoute } from 'next';
import { NOINDEX } from '@/content/site';

/**
 * Generated at build time into `/robots.txt`.
 *
 * Staging builds (`NEXT_PUBLIC_NOINDEX=true`) disallow everything so the
 * temporary subdomain never competes with the real domain in search results.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return { rules: { userAgent: '*', allow: '/' } };
}
