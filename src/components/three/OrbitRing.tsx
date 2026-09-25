'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { colors } from '@/styles/tokens';

function ringPoints(radius: number, segments = 128): Vector3[] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });
}

interface OrbitRingProps {
  radius: number;
  dashed?: boolean;
  opacity?: number;
}

/** A flat HUD ring lying in the XZ plane; the parent group supplies the tilt. */
export function OrbitRing({ radius, dashed = false, opacity = 0.35 }: OrbitRingProps) {
  const points = useMemo(() => ringPoints(radius), [radius]);

  return (
    <Line
      points={points}
      color={colors.accent}
      lineWidth={1}
      transparent
      opacity={opacity}
      dashed={dashed}
      dashSize={0.12}
      gapSize={0.1}
    />
  );
}
