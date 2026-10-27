import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { Instrumento } from '../../types';

interface Props {
  instrumento: Instrumento;
  onPress: () => void;
}

export function InstrumentCard({ instrumento, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center border border-gray-100"
    >
      <View className="w-16 h-16 bg-blue-50 rounded-lg justify-center items-center mr-4 overflow-hidden">
        {instrumento.imagen_url ? (
          <Image source={{ uri: instrumento.imagen_url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-blue-500 text-2xl font-bold">{instrumento.nombre.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold text-gray-800">{instrumento.nombre}</Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
          {instrumento.descripcion || "Sin descripción disponible"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
