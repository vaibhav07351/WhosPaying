import type { ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BulkNameInput } from './BulkNameInput';
import { MAX_NAME_LENGTH, colors, radii, spacing } from '../theme';

type NameEntryProps = {
  bulkOpen: boolean;
  bulkDraft: string;
  draft: string;
  spinning: boolean;
  hasNames: boolean;
  onBulkChange: (value: string) => void;
  onBulkSubmit: () => void;
  onDraftChange: (value: string) => void;
  onAddOne: () => void;
  onToggleBulk: () => void;
  onClearAll: () => void;
};

export function NameEntry({
  bulkOpen,
  bulkDraft,
  draft,
  spinning,
  hasNames,
  onBulkChange,
  onBulkSubmit,
  onDraftChange,
  onAddOne,
  onToggleBulk,
  onClearAll,
}: NameEntryProps): ReactElement {
  return (
    <View style={styles.wrap}>
      {bulkOpen ? (
        <BulkNameInput
          value={bulkDraft}
          disabled={spinning}
          onChange={onBulkChange}
          onSubmit={onBulkSubmit}
        />
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={onDraftChange}
            placeholder="Add a name"
            placeholderTextColor={colors.muted}
            maxLength={MAX_NAME_LENGTH}
            autoCorrect={false}
            autoCapitalize="words"
            autoComplete="off"
            textContentType="nickname"
            returnKeyType="done"
            editable={!spinning}
            onSubmitEditing={onAddOne}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add name"
            disabled={spinning}
            onPress={onAddOne}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
              spinning && styles.disabled,
            ]}
          >
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      )}
      {hasNames ? (
        <View style={styles.rowActions}>
          <Pressable disabled={spinning} onPress={onToggleBulk}>
            <Text style={styles.link}>{bulkOpen ? 'Add one name' : 'Add several'}</Text>
          </Pressable>
          <Pressable disabled={spinning} onPress={onClearAll}>
            <Text style={styles.link}>Clear all</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.4,
  },
});
