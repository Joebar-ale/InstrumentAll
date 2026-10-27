import React from 'react';
import { TextInput } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export interface TextNode {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface Props {
  node: TextNode;
  onUpdateText: (id: string, text: string) => void;
}

export function DraggableText({ node, onUpdateText }: Props) {
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
      <Animated.View style={animatedStyle} className="p-2 bg-yellow-100/90 border border-yellow-300 rounded-lg min-w-[120px] shadow-sm z-40">
        <TextInput 
          value={node.text}
          onChangeText={(val) => onUpdateText(node.id, val)}
          placeholder="Toca para escribir..."
          placeholderTextColor="#9ca3af"
          className="text-gray-800 font-bold"
          multiline
        />
      </Animated.View>
    </GestureDetector>
  );
}
