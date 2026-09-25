import { brand, footer } from '@/content/site';
import { Container } from '../ui/Container';
import { Logo } from '../ui/Logo';

/** Site footer. Privacy and Terms are placeholders until those pages exist. */
export function Footer() {
  return (
    <footer className="border-line bg-bg border-t py-12">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Logo />
          <p className="text-body-s text-muted mt-3 max-w-xs">{brand.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {footer.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-ink-soft hover:text-ink text-body-s rounded-sm transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-body-s text-muted">{brand.copyright}</p>
      </Container>
    </footer>
  );
}
