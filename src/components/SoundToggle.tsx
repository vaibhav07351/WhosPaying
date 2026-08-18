import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { colors, radii } from '../theme';

type SoundToggleProps = {
  muted: boolean;
  onToggle: () => void;
};

function SpeakerIcon({ muted }: { muted: boolean }): ReactElement {
  const color: string = muted ? colors.muted : colors.gold;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M3.5 9.2h3.1L11 5.4v13.2L6.6 14.8H3.5V9.2z"
        fill={color}
      />
      {muted ? (
        <Line
          x1="15.2"
          y1="8"
          x2="21"
          y2="16.2"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      ) : (
        <>
          <Path
            d="M14.8 9.1c1.15.95 1.8 2.2 1.8 2.9 0 .7-.65 1.95-1.8 2.9"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M17.6 6.8c1.9 1.55 2.95 3.5 2.95 5.2s-1.05 3.65-2.95 5.2"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

export function SoundToggle({
  muted,
  onToggle,
}: SoundToggleProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Spin sound"
      accessibilityState={{ checked: !muted }}
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [
        styles.pill,
        muted ? styles.pillOff : styles.pillOn,
        pressed && styles.pressed,
      ]}
    >
      <SpeakerIcon muted={muted} />
      <Text style={[styles.label, muted ? styles.labelOff : styles.labelOn]}>
        {muted ? 'Sound off' : 'Sound on'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillOn: {
    backgroundColor: 'rgba(245, 197, 24, 0.14)',
    borderColor: 'rgba(245, 197, 24, 0.55)',
  },
  pillOff: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceAlt,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelOn: {
    color: colors.gold,
  },
  labelOff: {
    color: colors.muted,
  },
  pressed: {
    opacity: 0.82,
  },
});
