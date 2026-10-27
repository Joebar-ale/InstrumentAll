import React from 'react';
import { Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export interface ImageNode {
  id: string;
  uri: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  node: ImageNode;
}

export function DraggableImage({ node }: Props) {
  const translateX = useSharedValue(node.x);
  const translateY = useSharedValue(node.y);
  const startX = useSharedValue(node.x);
  const startY = useSharedValue(node.y);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      position: 'absolute',
      left: 0,
      top: 0,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="z-30 p-1 bg-white/50 border border-gray-300 rounded shadow-md">
        <Image 
          source={{ uri: node.uri }} 
          style={{ width: node.width, height: node.height, borderRadius: 4 }} 
          resizeMode="cover"
        />
      </Animated.View>
    </GestureDetector>
  );
}
