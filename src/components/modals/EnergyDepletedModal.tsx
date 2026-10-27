import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface EnergyDepletedModalProps {
  visible: boolean;
  onRequestPremium: () => void;
}

export function EnergyDepletedModal({ visible, onRequestPremium }: EnergyDepletedModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="bg-white rounded-xl p-6 w-full max-w-sm items-center shadow-lg">
          <Text className="text-xl font-bold text-red-600 mb-2">Energía Agotada</Text>
          <Text className="text-center text-gray-700 mb-6">
            Has agotado tus 15 consultas offline gratuitas. Conéctate a internet para recargar la energía o actualiza a Premium para acceso offline ilimitado.
          </Text>
          
          <TouchableOpacity 
            className="w-full bg-blue-600 py-3 rounded-lg mb-2"
            onPress={onRequestPremium}
          >
            <Text className="text-white text-center font-semibold text-base">Actualizar a Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
