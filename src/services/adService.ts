import mobileAds from 'react-native-google-mobile-ads';

export async function initializeAds(): Promise<void> {
  try {
    await mobileAds().initialize();
  } catch (error) {
    console.warn("Failed to initialize AdMob:", error);
  }
}
