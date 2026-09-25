'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { hero } from '@/content/site';
import { motionTokens } from '@/styles/tokens';
import { ActionCard } from '../mock/ActionCard';
import { FeedScreen } from '../mock/FeedScreen';
import { PhoneFrame } from '../mock/PhoneFrame';
import { PushBanner } from '../mock/PushBanner';
import { useCan3d, useIdleInView, usePrefersReducedMotion } from '../three/useReducedMotion';

/** The 3D depth layer is a separate lazy chunk — it never blocks the headline. */
const HeroScene = dynamic(() => import('../three/HeroScene'), { ssr: false });

/** Feed rows the orbiting agent nodes map onto, in orbit order. */
const NODE_TO_ACTION = ['hero-job', 'hero-invoice', 'hero-sales', 'hero-social'] as const;

/**
 * The hero's phone composition — the only interactive part of the hero, and the
 * only part that hydrates. Entrance, idle float and the push-banner drop are
 * CSS keyframes; the WebGL depth layer is deferred to an idle callback.
 */
export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  // Bumping the key remounts the banner, which replays its CSS drop-in.
  const [pushKey, setPushKey] = useState(0);

  const reduced = usePrefersReducedMotion();
  const can3d = useCan3d();
  const scene3dReady = useIdleInView(stageRef, can3d);

  // When a signal lands, drop the push banner in and pulse the matching row.
  const onSignalArrive = useCallback((nodeIndex: number) => {
    setPulsingId(NODE_TO_ACTION[nodeIndex % NODE_TO_ACTION.length] ?? null);
    setPushKey((k) => k + 1);
  }, []);

  // Clear the pulse a moment after it lands.
  useEffect(() => {
    if (!pulsingId) return;
    const t = window.setTimeout(() => setPulsingId(null), 2200);
    return () => window.clearTimeout(t);
  }, [pulsingId]);

  // The idle-float duration stays driven by the shared motion token.
  const floatStyle = {
    '--float-duration': `${motionTokens.phoneFloatSeconds}s`,
  } as CSSProperties;

  return (
    <div ref={stageRef} className="stage-3d relative mx-auto w-full max-w-[420px] lg:max-w-none">
      {scene3dReady ? <HeroScene onSignalArrive={onSignalArrive} /> : null}

      {/* Reduced motion gets a static poster instead of the live composition. */}
      {reduced ? (
        <Image
          src="/posters/hero-poster.webp"
          alt={hero.posterAlt}
          width={688}
          height={768}
          priority
          className="mx-auto h-auto w-full max-w-[380px]"
        />
      ) : (
        <div className="relative flex justify-center py-10 sm:px-10 lg:px-0">
          {/* Flying glass action card, top-left of the phone. */}
          <div className="absolute -top-1 left-0 z-20 hidden w-[220px] motion-safe:animate-[card-in_0.7s_cubic-bezier(0.22,1,0.36,1)_0.35s_both] sm:block lg:-left-20">
            <ActionCard
              glass
              action={{
                id: 'hero-flying',
                source: hero.flyingCard.source,
                status: 'pending',
                title: hero.flyingCard.title,
                preview: hero.flyingCard.preview,
              }}
            />
          </div>

          {/* The phone: entrance, then an endless idle float. */}
          <div
            style={floatStyle}
            className="relative z-10 motion-safe:animate-[phone-in_0.6s_ease-out_both,phone-float_var(--float-duration)_ease-in-out_0.6s_infinite]"
          >
            <div className="preserve-3d [transform:rotateZ(-7deg)_rotateY(8deg)]">
              <PhoneFrame
                label={hero.posterAlt}
                className="h-[532px] w-[264px] sm:h-[600px] sm:w-[300px]"
              >
                <FeedScreen pulsingId={pulsingId} />
              </PhoneFrame>
            </div>
          </div>

          {/* Push banner dropping over the top of the phone. */}
          <div className="pointer-events-none absolute top-20 left-1/2 z-30 w-[260px] -translate-x-1/2 sm:top-28 sm:w-[290px]">
            <div
              key={pushKey}
              className="motion-safe:animate-[push-drop_0.5s_cubic-bezier(0.22,1.4,0.4,1)_both]"
            >
              <PushBanner />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
