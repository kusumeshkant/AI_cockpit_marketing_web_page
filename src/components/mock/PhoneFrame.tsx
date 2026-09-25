import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  /** Extra classes for the inner screen (e.g. a green glow ring). */
  screenClassName?: string;
  /** Hides the decorative status bar (never needed for a11y). */
  statusBar?: boolean;
  /**
   * Accessible description of the whole mock. The device is an illustration of
   * the app, so it is exposed as a single labelled image and its contents are
   * hidden from assistive technology.
   */
  label: string;
}

/**
 * The device shell used for every phone mock: rounded bezel, inner `paper`
 * screen and a decorative status bar.
 */
export function PhoneFrame({
  children,
  className,
  screenClassName,
  statusBar = true,
  label,
}: PhoneFrameProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'border-line-strong rounded-(--radius-phone) border-2 bg-[#04080C] p-2.5',
        'shadow-[var(--shadow-deep),var(--shadow-glow)]',
        className,
      )}
    >
      <div
        className={cn(
          'bg-paper relative flex h-full w-full flex-col overflow-hidden rounded-(--radius-screen)',
          screenClassName,
        )}
      >
        <div aria-hidden="true" className="contents">
          {statusBar ? (
            <div
              aria-hidden="true"
              className="text-muted text-label-s flex items-center justify-between px-5 pt-3.5 pb-1 font-mono"
            >
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span className="bg-muted/70 block h-2 w-1 rounded-[1px]" />
                <span className="bg-muted/70 block h-2.5 w-1 rounded-[1px]" />
                <span className="bg-muted block h-3 w-1 rounded-[1px]" />
                <span className="border-muted/70 ml-1 block h-2.5 w-4 rounded-[2px] border px-[1px] py-[1px]">
                  <span className="bg-muted block h-full w-2/3 rounded-[1px]" />
                </span>
              </span>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
