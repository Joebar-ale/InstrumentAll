import React from 'react';
import { Text, Dimensions, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import type { Instrumento } from '../../types';

interface Props {
  instrumento: Instrumento;
  onSuccess: (id: number) => void;
  onError: () => void;
  isLocked: boolean;
}

const { width: W, height: H } = Dimensions.get('window');
const DROP_ZONE_HEIGHT = H / 2;

export function DraggableInstrument({ instrumento, onSuccess, onError, isLocked }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Determinar límites del cuadrante correcto según tiempo_quirurgico_id
  const isCorrectQuadrant = (absoluteX: number, absoluteY: number) => {
    'worklet';
    const isTop = absoluteY < DROP_ZONE_HEIGHT / 2;
    const isBottom = absoluteY >= DROP_ZONE_HEIGHT / 2 && absoluteY < DROP_ZONE_HEIGHT;
    const isLeft = absoluteX < W / 2;
    const isRight = absoluteX >= W / 2;

    switch (instrumento.tiempo_quirurgico_id) {
      case 1: return isTop && isLeft;
      case 2: return isTop && isRight;
      case 3: return isBottom && isLeft;
      case 5: return isBottom && isRight;
      default: return false;
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!isLocked)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      if (event.absoluteY < DROP_ZONE_HEIGHT) {
        if (isCorrectQuadrant(event.absoluteX, event.absoluteY)) {
          runOnJS(onSuccess)(instrumento.id);
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          runOnJS(onError)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: isLocked ? 0.6 : 1,
    };
  });

  if (isLocked) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[animatedStyle]} 
        className="bg-white p-3 rounded-xl shadow-md border border-gray-200 w-24 h-24 justify-center items-center m-2 z-50"
      >
        <Text className="text-blue-600 font-bold text-center text-xs" numberOfLines={2}>
          {instrumento.nombre}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
