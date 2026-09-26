'use client';

import { useEffect, useState } from 'react';
import { RequestDemoButton } from '../inquiry/RequestDemoButton';
import { cn } from '../ui/cn';

/** Mobile-only bottom bar. Slides up once the hero has left the viewport. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById('top');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'bg-paper/95 border-line fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl',
        'px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden',
        'transition-transform duration-300 motion-reduce:transition-none',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      aria-hidden={!visible}
      inert={!visible}
    >
      <RequestDemoButton className="w-full" />
    </div>
  );
}
