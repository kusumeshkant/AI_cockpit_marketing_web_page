'use client';

import { useState } from 'react';
import { cta } from '@/content/site';
import { DemoModal } from './DemoModal';
import { Button } from './ui/Button';
import { PlayIcon } from './ui/icons';

/**
 * The secondary hero CTA plus the modal it opens. Isolated so the rest of the
 * hero — headline, sub-copy, primary CTA — stays server-rendered and never
 * hydrates.
 */
export function WatchDemoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        leading={<PlayIcon className="size-4" />}
        className={className}
      >
        {cta.secondary}
      </Button>
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
