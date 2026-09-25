'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { hero } from '@/content/site';
import { motionTokens } from '@/styles/tokens';
import { AgentNode } from './AgentNode';
import { OrbitRing } from './OrbitRing';
import { SignalParticles } from './SignalParticles';

const ORBIT_RADIUS = 2.35;
const INNER_RADIUS = 1.75;

interface HeroSceneProps {
  /** Called when a signal particle reaches the phone. */
  onSignalArrive?: (nodeIndex: number) => void;
}

/** Tilts the whole rig and applies gentle mouse parallax. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const { pointer } = useThree();
  const max = (motionTokens.parallaxDegrees * Math.PI) / 180;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const targetY = pointer.x * max;
    const targetX = -1.02 + pointer.y * max;
    const lerp = Math.min(1, delta * 2.5);
    g.rotation.y += (targetY - g.rotation.y) * lerp;
    g.rotation.x += (targetX - g.rotation.x) * lerp;
  });

  return (
    <group ref={group} rotation={[-1.02, 0, 0]}>
      {children}
    </group>
  );
}

/**
 * The hero's background depth layer: a tilted orbit ring, four agent nodes and
 * the signal particles that travel to the phone. Purely decorative — it carries
 * no text and is never on the critical path (lazy-loaded, desktop only).
 */
export default function HeroScene({ onSignalArrive }: HeroSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause the render loop when the tab is hidden or the hero scrolls away.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;

    let inView = true;
    const sync = () => setActive(inView && document.visibilityState === 'visible');

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute -inset-x-16 inset-y-0 lg:-inset-x-28" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8.6], fov: 42 }}
        style={{ background: 'transparent' }}
      >
        <Rig>
          <OrbitRing radius={ORBIT_RADIUS} opacity={0.35} />
          <OrbitRing radius={INNER_RADIUS} dashed opacity={0.22} />
          {hero.agentNodes.map((label, i) => (
            <AgentNode
              key={label}
              label={label}
              angle={(i / hero.agentNodes.length) * Math.PI * 2}
              radius={ORBIT_RADIUS}
            />
          ))}
          <SignalParticles
            radius={ORBIT_RADIUS}
            nodeCount={hero.agentNodes.length}
            onArrive={onSignalArrive}
          />
        </Rig>
      </Canvas>
    </div>
  );
}
