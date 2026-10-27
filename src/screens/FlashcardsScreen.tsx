import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { QUERY_FLASHCARDS_ALEATORIAS } from '../database/schema';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

interface FlashcardItem {
  id: number;
  nombre: string;
  imagen_url: string | null;
}

export function FlashcardsScreen({ navigation }: any) {
  const db = useSQLiteContext();
  const { triggerAdIfFree, loadAd } = useInterstitialAd();
  
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  // Animación de rotación 3D
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAd(); // Pre-cargar interstitial al montar la pantalla
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const result = await db.getAllAsync<FlashcardItem>(QUERY_FLASHCARDS_ALEATORIAS);
      setCards(result);
      setScore({ correct: 0, incorrect: 0 });
      setFinished(false);
      setIsFlipped(false);
      animatedValue.setValue(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    nextCard();
  };

  const nextCard = () => {
    if (cards.length === 1) {
      // Era la última tarjeta
      setCards([]);
      setFinished(true);
      triggerAdIfFree(); // Monetización: mostrar anuncio al finalizar la ronda
    } else {
      // Restablecer animación para la siguiente carta
      setIsFlipped(false);
      animatedValue.setValue(0);
      setCards(prev => prev.slice(1));
    }
  };

  // Interpolaciones para el 3D Flip
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (finished) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="bg-white rounded-2xl p-8 w-full items-center shadow-sm border border-gray-100">
          <Text className="text-4xl mb-4">🏆</Text>
          <Text className="text-2xl font-black text-gray-800 mb-2">Ronda Completada</Text>
          <Text className="text-lg text-gray-600 mb-6">Aquí tienes tu resultado:</Text>
          
          <View className="flex-row justify-around w-full mb-8">
            <View className="items-center">
              <Text className="text-3xl font-bold text-green-600">{score.correct}</Text>
              <Text className="text-gray-500 font-semibold">Acertadas</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-red-600">{score.incorrect}</Text>
              <Text className="text-gray-500 font-semibold">Para Repasar</Text>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-blue-600 w-full py-4 rounded-xl flex-row justify-center items-center"
            onPress={fetchCards}
          >
            <Text className="text-white font-bold text-lg">🔄 Reiniciar Ronda</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cards.length === 0) return null;

  const currentCard = cards[0];

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      
      {/* Indicador de progreso */}
      <Text className="text-gray-500 font-bold mb-6">
        Tarjeta {11 - cards.length} de 10
      </Text>

      {/* Contenedor de la Tarjeta (Click to Flip) */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleFlip}
        className="w-full aspect-[3/4] relative perspective-1000"
      >
        {/* CARA FRONTAL (Imagen) */}
        <Animated.View 
          className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100 items-center justify-center p-4 backface-hidden"
          style={[frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}
        >
          {currentCard.imagen_url ? (
            <Image 
              source={{ uri: currentCard.imagen_url }} 
              className="w-4/5 h-4/5 rounded-xl" 
              resizeMode="contain" 
            />
          ) : (
            <Text className="text-blue-200 text-9xl font-black">?</Text>
          )}
          <Text className="text-gray-400 font-semibold mt-4 text-sm uppercase tracking-widest">
            Toca para revelar
          </Text>
        </Animated.View>

        {/* CARA TRASERA (Nombre) */}
        <Animated.View 
          className="absolute inset-0 bg-blue-600 rounded-3xl shadow-lg border border-blue-700 items-center justify-center p-8 backface-hidden"
          style={[backAnimatedStyle, { backfaceVisibility: 'hidden' }]}
        >
          <Text className="text-white text-3xl font-black text-center leading-tight">
            {currentCard.nombre}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Botones de Acción (Solo visibles si la carta fue volteada) */}
      <View className={`w-full flex-row justify-between mt-10 px-4 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
        <TouchableOpacity 
          disabled={!isFlipped}
          onPress={() => handleAnswer(false)}
          className="bg-red-100 border border-red-300 w-[45%] py-4 rounded-xl items-center shadow-sm"
        >
          <Text className="text-red-700 font-bold text-lg">❌ Repasar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={!isFlipped}
          onPress={() => handleAnswer(true)}
          className="bg-green-100 border border-green-300 w-[45%] py-4 rounded-xl items-center shadow-sm"
        >
          <Text className="text-green-700 font-bold text-lg">✅ Lo sabía</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
