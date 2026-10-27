import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

// El código maestro debería venir de variables de entorno en producción.
const MASTER_CODE = "INSTRUMENTALL_MASTER_2026";

export function SettingsScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [showBackdoor, setShowBackdoor] = useState(false);
  const [code, setCode] = useState("");
  
  const { isPremium, upgradeToPremium, downgradeToFree } = useAuthStore();

  const handleTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setShowBackdoor(true);
        return 0;
      }
      return newCount;
    });

    // Resetear contador si no completa los 7 taps rápido (simplificado con timeout)
    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  const verifyCode = () => {
    if (code === MASTER_CODE) {
      upgradeToPremium();
      Alert.alert("Éxito", "Privilegios Premium vitalicios activados.");
      setShowBackdoor(false);
      setCode("");
    } else {
      Alert.alert("Error", "Código inválido.");
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      
      {/* Zona de toques invisibles en el título */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6 items-center border border-gray-100">
          <Text className="text-2xl font-bold text-gray-800">Perfil y Ajustes</Text>
          <Text className="text-gray-500 mt-2">
            Estado actual: {isPremium ? "⭐ Premium" : "Gratuito"}
          </Text>
        </View>
      </TouchableWithoutFeedback>

      {/* Backdoor Oculto */}
      {showBackdoor && (
        <View className="bg-red-50 p-4 rounded-xl border border-red-200 mt-4">
          <Text className="text-red-800 font-bold mb-2">⚡ Backdoor de Desarrollo</Text>
          <TextInput
            className="bg-white border border-red-300 rounded-lg p-3 mb-3"
            placeholder="Ingrese código maestro..."
            value={code}
            onChangeText={setCode}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity 
            className="bg-red-600 py-3 rounded-lg items-center"
            onPress={verifyCode}
          >
            <Text className="text-white font-bold">Activar Privilegios</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Utilidad de debug para limpiar estado */}
      {isPremium && (
        <TouchableOpacity 
          className="bg-gray-200 py-3 rounded-lg items-center mt-auto mb-4"
          onPress={downgradeToFree}
        >
          <Text className="text-gray-700 font-bold">Revocar Premium (Test)</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}
