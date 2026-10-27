import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useOfflineGuard } from '../hooks/useOfflineGuard';

export function StudyHubScreen({ navigation }: any) {
  const { canStudy, isPremium, isOnline } = useOfflineGuard();

  const handleNavigation = (route: string) => {
    if (canStudy) {
      navigation.navigate(route);
    } else {
      // Si no puede estudiar es porque es Free y está Offline
      Alert.alert(
        "Modo Offline Restringido",
        "El Módulo de Estudio requiere conexión a internet para usuarios gratuitos.\n\nConéctate a internet o actualiza a Premium para acceso total offline.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Actualizar a Premium", onPress: () => navigation.navigate('Ajustes') }
        ]
      );
    }
  };

  const renderModuleCard = (title: string, route: string, colorClass: string, icon: string) => {
    const blocked = !canStudy;

    return (
      <TouchableOpacity
        onPress={() => handleNavigation(route)}
        activeOpacity={0.8}
        className={`w-[48%] aspect-square rounded-2xl p-4 justify-between shadow-sm mb-4 border border-gray-100 ${colorClass}`}
      >
        <Text className="text-3xl">{icon}</Text>
        <View>
          <Text className="text-lg font-extrabold text-gray-800">{title}</Text>
          {blocked && (
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-red-600 font-bold">🔒 Req. Internet / Premium</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4" contentContainerStyle={{ paddingBottom: 80 }}>
      
      <View className="mb-6 mt-2">
        <Text className="text-2xl font-black text-blue-900">Módulo de Estudio</Text>
        <Text className="text-gray-600 mt-2 leading-relaxed">
          Pon a prueba tus conocimientos sobre el instrumental quirúrgico y prepárate para el quirófano.
        </Text>

        {!isOnline && !isPremium && (
          <View className="bg-red-50 p-3 rounded-lg border border-red-200 mt-4 flex-row items-center">
            <Text className="text-red-700 font-semibold flex-1">
              Estás offline. Las funciones de estudio están deshabilitadas temporalmente.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap justify-between">
        {renderModuleCard('Flashcards', 'Flashcards', 'bg-blue-50', '🎴')}
        {renderModuleCard('Quiz', 'Quiz', 'bg-green-50', '📝')}
        {renderModuleCard('Pizarra', 'Pizarra', 'bg-yellow-50', '✏️')}
        {renderModuleCard('Simulador', 'SimuladorMesa', 'bg-purple-50', '🧤')}
      </View>

    </ScrollView>
  );
}
