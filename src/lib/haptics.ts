import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

function pulse(ms: number): void {
  Vibration.vibrate(ms);
}

function pulsePattern(pattern: number[]): void {
  Vibration.vibrate(pattern);
}

export function hapticTick(): void {
  if (Platform.OS === 'android') {
    pulse(16);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    return;
  }
  Haptics.selectionAsync().catch(() => pulse(12));
}

export function hapticSpinStart(): void {
  if (Platform.OS === 'android') {
    pulse(32);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => pulse(30));
}

export function hapticWin(): void {
  if (Platform.OS === 'android') {
    pulsePattern([0, 35, 45, 70]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() =>
    pulse(40),
  );
}

export function hapticWarn(): void {
  if (Platform.OS === 'android') {
    pulse(24);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => undefined,
    );
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() =>
    pulse(20),
  );
}

export function hapticLight(): void {
  if (Platform.OS === 'android') {
    pulse(14);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => pulse(10));
}
