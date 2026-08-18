import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SPIN_DURATION_MS } from '../theme';

const MUTE_KEY = 'whos-paying.muted';
const START_RATE = 2;
const END_RATE = 0.12;
const SPIN_VOLUME = 0.92;

export function useSpinAudio(): {
  muted: boolean;
  toggleMuted: () => void;
  startSpinSound: () => void;
  stopSpinSound: () => void;
  playWinSound: () => void;
} {
  const spinPlayer = useAudioPlayer(require('../../assets/sounds/spin.wav'));
  const winPlayer = useAudioPlayer(require('../../assets/sounds/win.wav'));
  const [muted, setMuted] = useState<boolean>(false);
  const rampRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRamp = useCallback((): void => {
    if (rampRef.current !== null) {
      clearInterval(rampRef.current);
      rampRef.current = null;
    }
  }, []);

  useEffect(() => {
    spinPlayer.loop = true;
    spinPlayer.volume = SPIN_VOLUME;
    spinPlayer.shouldCorrectPitch = false;
    winPlayer.volume = 0.8;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => undefined);
    AsyncStorage.getItem(MUTE_KEY)
      .then((raw: string | null) => {
        if (raw === '1') {
          setMuted(true);
        }
      })
      .catch(() => undefined);
    return () => {
      clearRamp();
    };
  }, [clearRamp, spinPlayer, winPlayer]);

  const startSpinSound = useCallback((): void => {
    clearRamp();
    if (muted) {
      return;
    }
    spinPlayer.loop = true;
    spinPlayer.volume = SPIN_VOLUME;
    spinPlayer.shouldCorrectPitch = false;
    spinPlayer.setPlaybackRate(START_RATE);
    spinPlayer.seekTo(0).catch(() => undefined);
    spinPlayer.play();
    const startedAt: number = Date.now();
    rampRef.current = setInterval(() => {
      const t: number = Math.min(1, (Date.now() - startedAt) / SPIN_DURATION_MS);
      // Match cubic ease-out velocity: fast at first, then a long slowdown.
      const speed: number = (1 - t) * (1 - t);
      const rate: number = END_RATE + (START_RATE - END_RATE) * speed;
      spinPlayer.setPlaybackRate(Math.max(END_RATE, rate));
      spinPlayer.volume = t > 0.88 ? SPIN_VOLUME * (1 - (t - 0.88) / 0.12) : SPIN_VOLUME;
      if (t >= 1) {
        clearRamp();
        spinPlayer.pause();
        spinPlayer.volume = SPIN_VOLUME;
      }
    }, 40);
  }, [clearRamp, muted, spinPlayer]);

  const stopSpinSound = useCallback((): void => {
    clearRamp();
    spinPlayer.pause();
    spinPlayer.volume = SPIN_VOLUME;
  }, [clearRamp, spinPlayer]);

  const playWinSound = useCallback((): void => {
    clearRamp();
    spinPlayer.pause();
    if (muted) {
      return;
    }
    winPlayer.seekTo(0).catch(() => undefined);
    winPlayer.play();
  }, [clearRamp, muted, spinPlayer, winPlayer]);

  const toggleMuted = useCallback((): void => {
    setMuted((current: boolean) => {
      const next: boolean = !current;
      AsyncStorage.setItem(MUTE_KEY, next ? '1' : '0').catch(() => undefined);
      if (next) {
        clearRamp();
        spinPlayer.pause();
      }
      return next;
    });
  }, [clearRamp, spinPlayer]);

  return { muted, toggleMuted, startSpinSound, stopSpinSound, playWinSound };
}
