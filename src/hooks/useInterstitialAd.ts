import { useState, useEffect } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { useAuthStore } from '../store/useAuthStore';
import { AD_UNIT_IDS } from '../constants/config';

// Instancia global compartida para cargar rápidamente
const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL);

interface UseInterstitialAdReturn {
  isLoaded: boolean;
  isClosed: boolean;
  loadAd: () => void;
  triggerAdIfFree: () => void;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  const isPremium = useAuthStore((s) => s.isPremium);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsClosed(true);
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const loadAd = () => {
    if (!isPremium && !isLoaded) {
      try {
        interstitial.load();
      } catch (error) {
        console.warn("Failed to load interstitial ad:", error);
      }
    }
  };

  const triggerAdIfFree = () => {
    if (!isPremium && isLoaded) {
      try {
        interstitial.show();
        setIsLoaded(false); // Reset para forzar una nueva recarga para la próxima vez
      } catch (error) {
        console.warn("Failed to show interstitial ad:", error);
      }
    }
  };

  return { isLoaded, isClosed, loadAd, triggerAdIfFree };
}
