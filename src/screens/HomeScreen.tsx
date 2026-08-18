import { useMemo, useState, type ReactElement } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptySetup } from '../components/EmptySetup';
import { NameEntry } from '../components/NameEntry';
import { NameList } from '../components/NameList';
import { PayWheel } from '../components/PayWheel';
import { SoundToggle } from '../components/SoundToggle';
import { WinnerModal } from '../components/WinnerModal';
import { useNames } from '../hooks/useNames';
import { useSpinAudio } from '../hooks/useSpinAudio';
import { hapticLight, hapticSpinStart, hapticWarn } from '../lib/haptics';
import { bulkMessage, errorMessage } from '../lib/nameMessages';
import { sanitizeNameInput } from '../lib/nameRules';
import { MIN_NAMES_TO_SPIN, colors, radii, spacing } from '../theme';
import type { AddManyResult, AddNameResult, Person } from '../types';

const PREVIEW_NAMES: readonly Person[] = [
  { id: 'preview-1', name: 'Alex' },
  { id: 'preview-2', name: 'Jordan' },
  { id: 'preview-3', name: 'Sam' },
  { id: 'preview-4', name: 'Riley' },
];

export function HomeScreen(): ReactElement {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { names, ready, addName, addMany, removeName, clearNames } = useNames();
  const { muted, toggleMuted, startSpinSound, stopSpinSound, playWinSound } =
    useSpinAudio();
  const [draft, setDraft] = useState<string>('');
  const [bulkDraft, setBulkDraft] = useState<string>('');
  const [showBulk, setShowBulk] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spinToken, setSpinToken] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<Person | null>(null);

  const wheelSize: number = useMemo(() => {
    const cap: number = Math.min(width - 32, height * 0.42, 380);
    return Math.max(240, cap);
  }, [height, width]);

  const showSetup: boolean = ready && names.length === 0;
  const wheelNames: readonly Person[] = showSetup ? PREVIEW_NAMES : names;
  const canSpin: boolean = names.length >= MIN_NAMES_TO_SPIN && !spinning;

  function handleAdd(): void {
    const result: AddNameResult = addName(draft);
    if (!result.ok) {
      setError(errorMessage(result.reason));
      hapticWarn();
      return;
    }
    setDraft('');
    setError(null);
    hapticLight();
  }

  function handleAddMany(): void {
    const summary: AddManyResult = addMany(bulkDraft);
    const message: string | null = bulkMessage(summary);
    if (summary.added === 0) {
      setError(message);
      hapticWarn();
      return;
    }
    setBulkDraft('');
    setShowBulk(false);
    setError(message);
    hapticLight();
  }

  function handleSpin(): void {
    if (!canSpin) {
      return;
    }
    Keyboard.dismiss();
    setWinner(null);
    setSpinning(true);
    setSpinToken((token: number) => token + 1);
    hapticSpinStart();
  }

  function handleSpinEnd(person: Person): void {
    stopSpinSound();
    playWinSound();
    setSpinning(false);
    setWinner(person);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Who's Paying</Text>
            <SoundToggle muted={muted} onToggle={toggleMuted} />
          </View>
          <Text style={styles.subtitle}>
            Add your friends, spin the wheel, and see who pays the bill.
          </Text>
        </View>

        <View style={styles.stage}>
          <Pressable
            style={[styles.wheelSlot, showSetup && styles.wheelSlotPreview]}
            onPress={Keyboard.dismiss}
          >
            <View
              pointerEvents={showSetup ? 'none' : 'auto'}
              style={showSetup ? styles.previewWheel : undefined}
            >
              <PayWheel
                names={wheelNames}
                size={wheelSize}
                spinToken={spinToken}
                idle={showSetup}
                onSpinStart={startSpinSound}
                onSpinEnd={handleSpinEnd}
              />
            </View>
          </Pressable>

          {showSetup ? (
            <EmptySetup
              value={bulkDraft}
              error={error}
              onChange={(value: string) => {
                setBulkDraft(value);
                if (error !== null) {
                  setError(null);
                }
              }}
              onSubmit={handleAddMany}
            />
          ) : names.length > 0 ? (
            <View style={styles.bottom}>
              <NameEntry
                bulkOpen={showBulk}
                bulkDraft={bulkDraft}
                draft={draft}
                spinning={spinning}
                hasNames={true}
                onBulkChange={(value: string) => {
                  setBulkDraft(value);
                  if (error !== null) {
                    setError(null);
                  }
                }}
                onBulkSubmit={handleAddMany}
                onDraftChange={(value: string) => {
                  setDraft(sanitizeNameInput(value).value);
                  if (error !== null) {
                    setError(null);
                  }
                }}
                onAddOne={handleAdd}
                onToggleBulk={() => setShowBulk((open: boolean) => !open)}
                onClearAll={() => {
                  clearNames();
                  setShowBulk(false);
                  setError(null);
                }}
              />
              {error !== null ? <Text style={styles.error}>{error}</Text> : null}
              <NameList names={names} disabled={spinning} onRemove={removeName} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Spin the wheel"
                disabled={!canSpin}
                onPress={handleSpin}
                style={({ pressed }) => [
                  styles.spin,
                  pressed && canSpin && styles.pressed,
                  !canSpin && styles.disabled,
                ]}
              >
                <Text style={styles.spinText}>
                  {spinning ? 'SPINNING' : 'SPIN'}
                </Text>
              </Pressable>
              {!canSpin && !spinning ? (
                <Text style={styles.hint}>Add at least 2 names to spin</Text>
              ) : (
                <Text style={styles.hint}>{names.length} on the wheel</Text>
              )}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
      <WinnerModal winner={winner} onDismiss={() => setWinner(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  stage: {
    flex: 1,
  },
  wheelSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelSlotPreview: {
    justifyContent: 'flex-start',
    paddingTop: spacing.lg,
  },
  previewWheel: {
    opacity: 0.55,
  },
  bottom: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  spin: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  spinText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  hint: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.4,
  },
});
