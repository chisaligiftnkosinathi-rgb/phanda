import { Platform } from 'react-native';

const isServer = typeof window === 'undefined';

const ExpoAsyncStorage = {
  getItem: async (key: string) => {
    if (isServer) return null;
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isServer) return;
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isServer) return;
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.removeItem(key);
  },
};

export const storage = Platform.OS === 'web' ? ExpoAsyncStorage : require('@react-native-async-storage/async-storage').default;
