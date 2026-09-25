'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { colors } from '@/styles/tokens';
import { motionTokens } from '@/styles/tokens';

interface AgentNodeProps {
  label: string;
  /** Starting angle on the orbit, in radians. */
  angle: number;
  radius: number;
  /** Shared clock offset so all nodes travel together. */
  speed?: number;
}

/**
 * A glass disc orbiting the phone, labelled with the agent platform.
 * Nodes on the far side of the orbit are dimmed and scaled down so the ring
 * reads as depth rather than a flat circle.
 */
export function AgentNode({ label, angle, radius, speed = 1 }: AgentNodeProps) {
  const group = useRef<Group>(null);
  const disc = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const t = (state.clock.getElapsedTime() / motionTokens.orbitSeconds) * Math.PI * 2 * speed;
    const a = angle + t;
    g.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);

    // sin(a) > 0 is the near side of the tilted ring (towards the camera).
    const depth = (Math.sin(a) + 1) / 2; // 0 = far, 1 = near
    const scale = 0.72 + depth * 0.45;
    g.scale.setScalar(scale);

    const opacity = 0.3 + depth * 0.7;
    const discMat = disc.current?.material as MeshBasicMaterial | undefined;
    const haloMat = halo.current?.material as MeshBasicMaterial | undefined;
    if (discMat) discMat.opacity = opacity * 0.5;
    if (haloMat) haloMat.opacity = opacity * 0.75;
    if (labelRef.current) labelRef.current.style.opacity = String(0.35 + depth * 0.65);
  });

  return (
    <group ref={group}>
      {/* The disc always faces the camera by counter-rotating the parent tilt. */}
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <mesh ref={disc}>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color={colors.surfaceAlt} transparent opacity={0.5} />
        </mesh>
        <mesh ref={halo}>
          <ringGeometry args={[0.16, 0.178, 48]} />
          <meshBasicMaterial color={colors.accentBright} transparent opacity={0.75} />
        </mesh>
        <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <span
            ref={labelRef}
            aria-hidden="true"
            className="text-accent-ink block translate-y-4 font-mono text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase select-none"
          >
            {label}
          </span>
        </Html>
      </group>
    </group>
  );
}
