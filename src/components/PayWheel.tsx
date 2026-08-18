import { useCallback, useEffect, useRef, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { hapticTick, hapticWin } from '../lib/haptics';
import {
  labelRotation,
  landingRotation,
  layoutSlices,
  nextTargetRotation,
  pickExtraTurns,
  pickWinnerIndex,
  pickWithinSliceOffset,
  polarToCartesian,
  slicePath,
  type Point,
  type SliceLayout,
} from '../lib/wheelGeometry';
import { colors, SPIN_DURATION_MS, wheelColors } from '../theme';
import type { Person } from '../types';

type PayWheelProps = {
  names: readonly Person[];
  size: number;
  spinToken: number;
  idle?: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Person) => void;
};

const HAPTIC_MIN_GAP_MS = 90;

let lastTickAt: number = 0;

function tickHaptic(): void {
  const now: number = Date.now();
  if (now - lastTickAt < HAPTIC_MIN_GAP_MS) {
    return;
  }
  lastTickAt = now;
  hapticTick();
}

function landHaptic(): void {
  hapticWin();
}

export function PayWheel({
  names,
  size,
  spinToken,
  idle = false,
  onSpinStart,
  onSpinEnd,
}: PayWheelProps): ReactElement {
  const rotation = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const spinning = useSharedValue(0);
  const sliceCount = useSharedValue(Math.max(names.length, 1));
  const namesRef = useRef(names);
  namesRef.current = names;
  const onSpinEndRef = useRef(onSpinEnd);
  onSpinEndRef.current = onSpinEnd;
  const onSpinStartRef = useRef(onSpinStart);
  onSpinStartRef.current = onSpinStart;

  const finishSpin = useCallback((winner: Person): void => {
    landHaptic();
    onSpinEndRef.current(winner);
  }, []);

  useEffect(() => {
    sliceCount.value = Math.max(names.length, 1);
  }, [names.length, sliceCount]);

  useEffect(() => {
    if (!idle) {
      cancelAnimation(rotation);
      return;
    }
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 18000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [idle, rotation]);

  useEffect(() => {
    if (idle || spinToken === 0) {
      return;
    }
    const frozen: readonly Person[] = namesRef.current;
    if (frozen.length < 2) {
      return;
    }
    // 1) Pick winner first — equal odds for every name, ignores current angle.
    // 2) Then animate the wheel to that slice from wherever it stopped last.
    const winnerIndex: number = pickWinnerIndex(frozen.length);
    const winner: Person | undefined = frozen[winnerIndex];
    if (winner === undefined) {
      return;
    }
    const extraTurns: number = pickExtraTurns();
    const landing: number = landingRotation(
      winnerIndex,
      frozen.length,
      pickWithinSliceOffset(frozen.length),
    );
    spinning.value = 1;
    sliceCount.value = frozen.length;
    cancelAnimation(rotation);
    cancelAnimation(shakeX);
    const current: number = rotation.value;
    const target: number = nextTargetRotation(current, extraTurns, landing);
    onSpinStartRef.current();
    // ~4.2s + cubic ease-out stays readable on slower phones.
    rotation.value = withTiming(
      target,
      {
        duration: SPIN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished?: boolean) => {
        'worklet';
        spinning.value = 0;
        if (finished === true) {
          shakeX.value = withSequence(
            withTiming(10, { duration: 45 }),
            withTiming(-8, { duration: 55 }),
            withTiming(4, { duration: 45 }),
            withTiming(0, { duration: 70 }),
          );
          runOnJS(finishSpin)(winner);
        }
      },
    );
  }, [idle, spinToken, finishSpin, rotation, shakeX, sliceCount, spinning]);

  useAnimatedReaction(
    () => {
      if (spinning.value !== 1 || sliceCount.value < 2) {
        return -1;
      }
      const sliceAngle: number = 360 / sliceCount.value;
      const local: number = ((360 - (rotation.value % 360)) % 360 + 360) % 360;
      return Math.floor(local / sliceAngle);
    },
    (index: number, previous: number | null) => {
      if (index >= 0 && previous !== null && index !== previous) {
        runOnJS(tickHaptic)();
      }
    },
  );

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  const cx: number = size / 2;
  const cy: number = size / 2;
  const radius: number = size / 2 - 8;
  const slices: SliceLayout[] = layoutSlices(names.length);
  const fontSize: number = names.length > 10 ? 11 : 14;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={wheelStyle}
        // Rasterize once, then rotate the texture — much cheaper than
        // redrawing SVG paths every frame on mid/low-end Android.
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
      >
        <Svg width={size} height={size}>
          {names.length === 0 ? (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={colors.surface}
              stroke={colors.surfaceAlt}
              strokeWidth={6}
            />
          ) : (
            names.map((person: Person, index: number) => {
              const slice: SliceLayout | undefined = slices[index];
              if (slice === undefined) {
                return null;
              }
              const fill: string =
                wheelColors[index % wheelColors.length] ?? '#FF3B6B';
              return (
                <Path
                  key={person.id}
                  d={slicePath(cx, cy, radius, slice.startDeg, slice.endDeg)}
                  fill={fill}
                  stroke={colors.background}
                  strokeWidth={2}
                />
              );
            })
          )}
          {names.map((person: Person, index: number) => {
            const slice: SliceLayout | undefined = slices[index];
            if (slice === undefined) {
              return null;
            }
            const labelPos: Point = polarToCartesian(
              cx,
              cy,
              radius * 0.62,
              slice.midDeg,
            );
            const label: string =
              person.name.length > 10
                ? `${person.name.slice(0, 9)}…`
                : person.name;
            return (
              <SvgText
                key={`${person.id}-label`}
                x={labelPos.x}
                y={labelPos.y}
                fill={colors.text}
                fontSize={fontSize}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${labelRotation(slice.midDeg)} ${labelPos.x} ${labelPos.y})`}
              >
                {label}
              </SvgText>
            );
          })}
          <Circle
            cx={cx}
            cy={cy}
            r={Math.max(22, size * 0.08)}
            fill={colors.hub}
            stroke={colors.hubRing}
            strokeWidth={3}
          />
        </Svg>
      </Animated.View>
      <View pointerEvents="none" style={styles.pointer}>
        <Svg width={28} height={34}>
          <Polygon points="14,34 0,0 28,0" fill={colors.pointer} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    zIndex: 2,
  },
});
