import type { ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { normalizeName, sanitizeBulkInput, splitBulkNames } from '../lib/nameRules';
import { colors, radii, spacing, wheelColors } from '../theme';

type EmptySetupProps = {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function EmptySetup({
  value,
  error,
  onChange,
  onSubmit,
}: EmptySetupProps): ReactElement {
  const preview: string[] = splitBulkNames(value)
    .map((part: string) => normalizeName(part))
    .filter((name: string) => name.length >= 2);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="none" />
      <Text style={styles.headline}>Who's paying tonight?</Text>
      <Text style={styles.body}>
        Add everyone in the group. Spin the wheel, and one person is picked at
        random to pay.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Names</Text>
        <TextInput
          value={value}
          onChangeText={(next: string) => onChange(sanitizeBulkInput(next))}
          placeholder="Aarav, Riya, Sam"
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          autoCorrect={false}
          autoCapitalize="words"
          autoComplete="off"
          style={styles.input}
        />
        <Text style={styles.hint}>Separate the names with commas or new lines</Text>
        {preview.length > 0 ? (
          <View style={styles.preview}>
            {preview.map((name: string, index: number) => (
              <View
                key={`${name}-${index}`}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      wheelColors[index % wheelColors.length] ?? colors.accent,
                  },
                ]}
              >
                <Text style={styles.chipText}>{name}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add names to the wheel"
          onPress={onSubmit}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Add to the wheel</Text>
        </Pressable>
        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 11, 15, 0.34)',
  },
  headline: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    zIndex: 1,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    maxWidth: 340,
    zIndex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    elevation: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 1,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 88,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
  },
  preview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ctaText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
