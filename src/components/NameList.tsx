import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import type { Person } from '../types';

type NameListProps = {
  names: readonly Person[];
  disabled: boolean;
  onRemove: (id: string) => void;
};

export function NameList({ names, disabled, onRemove }: NameListProps): ReactElement | null {
  if (names.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {names.map((person: Person) => (
        <View key={person.id} style={styles.chip}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          <Pressable
            accessibilityLabel={`Remove ${person.name}`}
            disabled={disabled}
            hitSlop={8}
            onPress={() => onRemove(person.id)}
            style={styles.remove}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 180,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  remove: {
    marginLeft: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.muted,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
});
