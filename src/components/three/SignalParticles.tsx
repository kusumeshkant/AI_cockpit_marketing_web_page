'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { CubicBezierCurve3, Vector3, type Mesh, type MeshBasicMaterial } from 'three';
import { colors, motionTokens } from '@/styles/tokens';

const TRAVEL_SECONDS = 1.6;

interface SignalParticlesProps {
  /** Orbit radius the particles depart from. */
  radius: number;
  /** Number of agent nodes — the emitter cycles through them. */
  nodeCount: number;
  /** Fired when a particle reaches the phone, with the emitting node index. */
  onArrive?: (nodeIndex: number) => void;
}

/**
 * Every ~4s a glowing particle leaves an agent node and travels a curved path
 * to the phone at the centre of the scene, dragging a faint dashed trail.
 */
export function SignalParticles({ radius, nodeCount, onArrive }: SignalParticlesProps) {
  const particle = useRef<Mesh>(null);
  const state = useRef({ startedAt: -1, nodeIndex: 0, delivered: false });

  const curve = useMemo(() => new CubicBezierCurve3(), []);

  // A static dashed guide so the signal path reads even between particles.
  const guidePoints = useMemo(() => {
    const from = new Vector3(radius, 0, 0);
    const c = new CubicBezierCurve3(
      from,
      new Vector3(radius * 0.7, 0.9, radius * 0.2),
      new Vector3(radius * 0.25, 0.6, -radius * 0.1),
      new Vector3(0, 0, 0),
    );
    return c.getPoints(48);
  }, [radius]);

  useFrame(({ clock }) => {
    const mesh = particle.current;
    if (!mesh) return;

    const now = clock.getElapsedTime();
    const s = state.current;

    // Start the first signal shortly after mount, then on a steady cadence.
    if (s.startedAt < 0) {
      s.startedAt = now + 1.2;
      s.nodeIndex = 0;
      s.delivered = false;
      return;
    }

    const elapsed = now - s.startedAt;

    if (elapsed < 0) {
      mesh.visible = false;
      return;
    }

    if (elapsed > TRAVEL_SECONDS) {
      mesh.visible = false;
      if (!s.delivered) {
        s.delivered = true;
        onArrive?.(s.nodeIndex);
      }
      if (elapsed > motionTokens.signalIntervalSeconds) {
        s.startedAt = now;
        s.nodeIndex = (s.nodeIndex + 1) % nodeCount;
        s.delivered = false;
      }
      return;
    }

    // Rebuild the curve from the node's current orbital position.
    const orbit = (now / motionTokens.orbitSeconds) * Math.PI * 2;
    const angle = (s.nodeIndex / nodeCount) * Math.PI * 2 + orbit;
    const from = new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    curve.v0.copy(from);
    curve.v1.set(from.x * 0.7, 0.9, from.z * 0.7);
    curve.v2.set(from.x * 0.25, 0.6, from.z * 0.25);
    curve.v3.set(0, 0, 0);

    const t = elapsed / TRAVEL_SECONDS;
    const eased = t * t * (3 - 2 * t);
    curve.getPoint(eased, mesh.position);
    mesh.visible = true;

    const material = mesh.material as MeshBasicMaterial;
    material.opacity = Math.sin(Math.min(t, 1) * Math.PI) * 0.95;
  });

  return (
    <group>
      <Line
        points={guidePoints}
        color={colors.accent}
        lineWidth={1}
        transparent
        opacity={0.18}
        dashed
        dashSize={0.1}
        gapSize={0.09}
      />
      <mesh ref={particle} visible={false}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={colors.accentBright} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
