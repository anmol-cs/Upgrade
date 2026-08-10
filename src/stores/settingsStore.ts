import { create } from 'zustand';
import { storage } from '@/database/mmkv';

interface SettingsState {
  reduceMotion: boolean;
  hasCompletedOnboarding: boolean;
  setReduceMotion: (value: boolean) => void;
  completeOnboarding: () => void;
}

const KEYS = {
  reduceMotion: 'settings.reduceMotion',
  onboarding: 'settings.hasCompletedOnboarding',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  reduceMotion: storage.getBoolean(KEYS.reduceMotion) ?? false,
  hasCompletedOnboarding: storage.getBoolean(KEYS.onboarding) ?? false,

  setReduceMotion: (value) => {
    storage.set(KEYS.reduceMotion, value);
    set({ reduceMotion: value });
  },

  completeOnboarding: () => {
    storage.set(KEYS.onboarding, true);
    set({ hasCompletedOnboarding: true });
  },
}));
