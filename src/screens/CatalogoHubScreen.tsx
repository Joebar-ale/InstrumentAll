import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function CatalogoHubScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <Text className="text-3xl font-black text-gray-800 mb-2 text-center">Catálogos</Text>
      <Text className="text-gray-500 mb-8 text-center">Elige qué biblioteca deseas consultar</Text>
      
      <TouchableOpacity 
        className="bg-blue-600 p-6 rounded-2xl mb-4 shadow-sm"
        onPress={() => navigation.navigate('CatalogoInstrumentos')}
      >
        <Text className="text-white text-xl font-bold mb-1">🛠️ Instrumentos</Text>
        <Text className="text-blue-100 text-sm">Explora el arsenal quirúrgico por tiempos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-indigo-600 p-6 rounded-2xl shadow-sm"
        onPress={() => navigation.navigate('CatalogoProcedimientos')}
      >
        <Text className="text-white text-xl font-bold mb-1">📋 Procedimientos</Text>
        <Text className="text-indigo-100 text-sm">Guías paso a paso de mesas quirúrgicas</Text>
      </TouchableOpacity>
    </View>
  );
}
