'use client';

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      size?: 'normal' | 'flexible' | 'invisible';
      appearance?: 'always' | 'execute' | 'interaction-only';
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileHandle {
  /** Resolves with a fresh token, or `undefined` when Turnstile is not configured. */
  getToken: () => Promise<string | undefined>;
  reset: () => void;
}

let scriptPromise: Promise<void> | null = null;

/** Loads the Turnstile script once per page, on demand. */
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('turnstile script failed'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile, rendered invisibly and executed on submit.
 *
 * With no site key — local development, or a preview before the variable is
 * set — this renders nothing and `getToken` resolves `undefined`. The endpoint
 * mirrors that: it only skips verification when its own secret is unset, so a
 * configured deployment can never be bypassed by an unconfigured client.
 */
export function Turnstile({ siteKey, ref }: { siteKey: string; ref?: Ref<TurnstileHandle> }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const pending = useRef<((token: string | undefined) => void) | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          size: 'invisible',
          callback: (token) => {
            pending.current?.(token);
            pending.current = null;
          },
          'error-callback': () => {
            pending.current?.(undefined);
            pending.current = null;
          },
          'expired-callback': () => {
            if (widgetId.current) window.turnstile?.reset(widgetId.current);
          },
        });
      })
      .catch(() => {
        // Leave the widget unrendered; getToken resolves undefined and the
        // server decides whether that is acceptable.
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  useImperativeHandle(
    ref,
    () => ({
      getToken: () =>
        new Promise<string | undefined>((resolve) => {
          if (!siteKey || !widgetId.current || !window.turnstile) return resolve(undefined);
          // Never hang the submit button on a challenge that does not answer.
          const timer = window.setTimeout(() => {
            pending.current = null;
            resolve(undefined);
          }, 15_000);
          pending.current = (token) => {
            window.clearTimeout(timer);
            resolve(token);
          };
          window.turnstile.execute(widgetId.current);
        }),
      reset: () => {
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }),
    [siteKey],
  );

  return <div ref={container} />;
}
