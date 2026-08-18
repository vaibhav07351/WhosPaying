import type { ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { sanitizeBulkInput } from '../lib/nameRules';
import { colors, radii, spacing } from '../theme';

type BulkNameInputProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function BulkNameInput({
  value,
  disabled,
  onChange,
  onSubmit,
}: BulkNameInputProps): ReactElement {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Add everyone at once</Text>
      <TextInput
        value={value}
        onChangeText={(next: string) => onChange(sanitizeBulkInput(next))}
        placeholder={'Aarav, Riya, Sam\nor one name per line'}
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        autoCorrect={false}
        autoCapitalize="words"
        autoComplete="off"
        editable={!disabled}
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add names to the wheel"
        disabled={disabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.buttonText}>Add to wheel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 96,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.4,
  },
});
