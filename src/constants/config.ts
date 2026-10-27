// ============================================
// Límites del sistema de energía offline
// ============================================
export const MAX_OFFLINE_QUERIES = 15;

// ============================================
// Base de datos SQLite
// ============================================
export const DATABASE_NAME = 'instrumentall.db';

// ============================================
// Claves de almacenamiento MMKV
// ============================================
export const STORAGE_KEYS = {
  AUTH: 'instrumentall-auth-storage',
  ENERGY: 'instrumentall-energy-storage',
} as const;

// ============================================
// AdMob — IDs de prueba (NUNCA usar reales en dev)
// ============================================
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

export const AD_UNIT_IDS = {
  BANNER: __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || ''
      : 'ca-app-pub-3514161044300854/TU_ID_BANNER_IOS',
      
  INTERSTITIAL: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || ''
      : 'ca-app-pub-3514161044300854/TU_ID_INTERSTITIAL_IOS',
} as const;

// ============================================
// Google Mobile Ads — App IDs (para app.json)
// ============================================
export const ADMOB_APP_IDS = {
  ANDROID: 'ca-app-pub-3514161044300854~4575873478',
  IOS: 'ca-app-pub-3514161044300854~0000000000',
} as const;
