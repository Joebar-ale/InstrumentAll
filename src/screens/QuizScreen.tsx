import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useDevConfigStore } from '../store/useDevConfigStore';

export function QuizScreen({ navigation }: any) {
  const { questions, loading, loadQuiz } = useQuizEngine();
  const { triggerAdIfFree, loadAd } = useInterstitialAd();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const { timers } = useDevConfigStore();

  useEffect(() => {
    loadAd();
    startNewQuiz();
  }, []);

  const startNewQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
    loadQuiz();
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Bloquear doble tap

    const currentQuestion = questions[currentIndex];
    setSelectedOption(option);

    const isCorrect = option === currentQuestion.correctName;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Avanzar después del tiempo dinámico (o 1500ms por defecto)
    setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        setFinished(true);
        triggerAdIfFree();
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      }
    }, timers.quizTransitionMs);
  };

  const getOptionStyle = (option: string, correctName: string) => {
    if (!selectedOption) return "bg-white border-gray-200"; // Default
    if (option === correctName) return "bg-green-100 border-green-500"; // Correcta siempre se revela
    if (option === selectedOption && option !== correctName) return "bg-red-100 border-red-500"; // Incorrecta seleccionada
    return "bg-white border-gray-200 opacity-50"; // Otras
  };

  const getOptionTextColor = (option: string, correctName: string) => {
    if (!selectedOption) return "text-gray-700";
    if (option === correctName) return "text-green-800 font-bold";
    if (option === selectedOption && option !== correctName) return "text-red-800 font-bold";
    return "text-gray-400";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 mt-4 font-semibold">Generando evaluación...</Text>
      </View>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Sigue practicando";
    let emoji = "📚";
    if (percentage >= 90) { message = "¡Excelente!"; emoji = "🏆"; }
    else if (percentage >= 70) { message = "¡Buen trabajo!"; emoji = "👏"; }

    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-lg border border-gray-100">
          <Text className="text-6xl mb-4">{emoji}</Text>
          <Text className="text-2xl font-black text-gray-800 mb-2">{message}</Text>
          <Text className="text-gray-500 font-semibold mb-6 uppercase tracking-widest">Resultado Final</Text>
          
          <View className="items-center mb-8 bg-green-50 w-full py-6 rounded-2xl border border-green-100">
            <Text className="text-5xl font-black text-green-600">{percentage}%</Text>
            <Text className="text-green-800 font-semibold mt-2">{score} de {questions.length} correctas</Text>
          </View>

          <TouchableOpacity 
            className="bg-green-600 w-full py-4 rounded-xl items-center mb-3"
            onPress={startNewQuiz}
          >
            <Text className="text-white font-bold text-lg">🔄 Repetir Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-100 w-full py-4 rounded-xl items-center border border-gray-200"
            onPress={() => navigation.navigate('StudyHub')}
          >
            <Text className="text-gray-700 font-bold text-lg">Volver al Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <View className="flex-1 bg-gray-50 p-6 items-center">
      
      {/* Progreso */}
      <View className="w-full flex-row justify-between items-center mb-6">
        <Text className="text-gray-500 font-bold uppercase text-xs tracking-widest">
          Evaluación en curso
        </Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 font-black">
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
      </View>

      {/* Imagen del Instrumento */}
      <View className="w-full aspect-square bg-white rounded-3xl shadow-sm border border-gray-100 items-center justify-center p-4 mb-8">
        {currentQ.imageUrl ? (
          <Image 
            source={{ uri: currentQ.imageUrl }} 
            className="w-4/5 h-4/5 rounded-xl" 
            resizeMode="contain" 
          />
        ) : (
          <Text className="text-gray-300 text-9xl font-black">?</Text>
        )}
      </View>

      {/* Opciones */}
      <View className="w-full flex-1 justify-end pb-4">
        {currentQ.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            disabled={selectedOption !== null}
            onPress={() => handleAnswer(option)}
            className={`w-full p-4 mb-3 rounded-xl border ${getOptionStyle(option, currentQ.correctName)}`}
          >
            <Text className={`text-center font-bold text-lg ${getOptionTextColor(option, currentQ.correctName)}`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}
