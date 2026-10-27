import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface LockedListItemProps {
  title: string;
  onUpgrade: () => void;
}

export function LockedListItem({ title, onUpgrade }: LockedListItemProps) {
  return (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center border border-gray-200 overflow-hidden relative">
      {/* Efecto borroso (simulado con opacidad y capa encima) */}
      <View className="flex-1 opacity-20">
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
          Descripción oculta para usuarios gratuitos...
        </Text>
      </View>

      {/* Capa de bloqueo y botón CTA */}
      <View className="absolute inset-0 justify-center items-center bg-white/60">
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
          onPress={onUpgrade}
        >
          <Text className="text-white font-bold mr-2">🔒 Desbloquear Procedimiento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
