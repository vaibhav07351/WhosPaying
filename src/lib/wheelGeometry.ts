export type Point = {
  readonly x: number;
  readonly y: number;
};

export type SliceLayout = {
  readonly startDeg: number;
  readonly endDeg: number;
  readonly midDeg: number;
};

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point {
  const radians: number = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

export function slicePath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start: Point = polarToCartesian(cx, cy, radius, startDeg);
  const end: Point = polarToCartesian(cx, cy, radius, endDeg);
  const largeArc: 0 | 1 = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function layoutSlices(count: number): SliceLayout[] {
  if (count <= 0) {
    return [];
  }
  const sliceAngle: number = 360 / count;
  return Array.from({ length: count }, (_, index) => {
    const startDeg: number = index * sliceAngle;
    const endDeg: number = (index + 1) * sliceAngle;
    return {
      startDeg,
      endDeg,
      midDeg: startDeg + sliceAngle / 2,
    };
  });
}

export function landingRotation(
  winnerIndex: number,
  count: number,
  withinSliceOffsetDeg: number = 0,
): number {
  const sliceAngle: number = 360 / count;
  // Pointer sits at the top. Land somewhere inside the winning slice
  // (not always the exact center) so the path from the previous stop
  // does not look biased. Offset is clamped to keep a clear margin.
  const half: number = sliceAngle / 2;
  const maxOffset: number = Math.max(0, half * 0.7);
  const offset: number = Math.max(-maxOffset, Math.min(maxOffset, withinSliceOffsetDeg));
  const winnerAngle: number = winnerIndex * sliceAngle + half + offset;
  return ((360 - winnerAngle) % 360 + 360) % 360;
}

export function pickExtraTurns(): number {
  // 6–9 turns over ~4.2s: shorter spin, still readable with cubic ease-out.
  return 6 + Math.floor(Math.random() * 4);
}

/**
 * Uniform pick in 0..count-1. Independent of wheel angle / last winner.
 * Uses rejection sampling so every index is exactly equally likely.
 */
export function pickWinnerIndex(count: number): number {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 0;
  }
  // 2^32 span avoids the tiny Math.random()*n bias for large n.
  const limit: number = 0x100000000;
  const max: number = Math.floor(limit / count) * count;
  let value: number = 0;
  do {
    value = Math.floor(Math.random() * limit);
  } while (value >= max);
  return value % count;
}

/** Random offset inside a slice, used only for where the pointer stops visually. */
export function pickWithinSliceOffset(count: number): number {
  const sliceAngle: number = 360 / count;
  const maxOffset: number = (sliceAngle / 2) * 0.7;
  return (Math.random() * 2 - 1) * maxOffset;
}

export function nextTargetRotation(
  current: number,
  extraTurns: number,
  landing: number,
): number {
  // current only affects HOW FAR we spin to reach the already-chosen
  // landing angle. It never changes who was picked.
  const normalized: number = ((current % 360) + 360) % 360;
  let delta: number = landing - normalized;
  if (delta <= 0) {
    delta += 360;
  }
  return current + extraTurns * 360 + delta;
}

export function labelRotation(midDeg: number): number {
  if (midDeg > 90 && midDeg < 270) {
    return midDeg + 180;
  }
  return midDeg;
}
