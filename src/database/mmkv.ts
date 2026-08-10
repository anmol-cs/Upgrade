import { MMKV } from 'react-native-mmkv';

/** Lightweight key-value storage for preferences, theme, feature flags. Never durable domain data. */
export const storage = new MMKV({ id: 'upgrade-preferences' });
