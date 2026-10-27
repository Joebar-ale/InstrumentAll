import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAuthStore } from '../../store/useAuthStore';
import { AD_UNIT_IDS } from '../../constants/config';

export function BottomBannerAd() {
  const isPremium = useAuthStore((s) => s.isPremium);

  if (isPremium) {
    return null;
  }

  return (
    <View className="absolute bottom-0 w-full items-center bg-transparent">
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
