import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuthStore } from '../store/useAuthStore';
import { QUERY_PROCEDIMIENTOS_POR_INSTRUMENTO } from '../database/schema';
import { LockedListItem } from '../components/ui/LockedListItem';
import type { Instrumento } from '../types';

export function InstrumentDetailScreen({ route, navigation }: any) {
  const { instrumento }: { instrumento: Instrumento } = route.params;
  const db = useSQLiteContext();
  const isPremium = useAuthStore((s) => s.isPremium);
  
  const [procedimientos, setProcedimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: instrumento.nombre });
    loadProcedimientos();
  }, [instrumento]);

  const loadProcedimientos = async () => {
    try {
      const result = await db.getAllAsync(
        QUERY_PROCEDIMIENTOS_POR_INSTRUMENTO,
        [instrumento.id]
      );
      setProcedimientos(result);
    } catch (error) {
      console.error("Error loading procedimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Aquí podrías abrir un modal o navegar a la pantalla de compra
    navigation.navigate('Settings'); // Temporalmente va a Settings para el Backdoor
  };

  const renderHeader = () => (
    <View className="bg-white p-6 rounded-b-3xl shadow-sm mb-4 items-center border-b border-gray-100">
      <View className="w-32 h-32 bg-blue-50 rounded-2xl justify-center items-center mb-4 overflow-hidden">
        {instrumento.imagen_url ? (
          <Image source={{ uri: instrumento.imagen_url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-blue-500 text-5xl font-bold">{instrumento.nombre.charAt(0)}</Text>
        )}
      </View>
      <Text className="text-2xl font-extrabold text-gray-800 text-center">{instrumento.nombre}</Text>
      {instrumento.descripcion && (
        <Text className="text-base text-gray-600 mt-2 text-center leading-relaxed">
          {instrumento.descripcion}
        </Text>
      )}
      <Text className="text-lg font-bold text-blue-900 mt-6 self-start">Procedimientos Relacionados</Text>
    </View>
  );

  const renderProcedimiento = ({ item, index }: { item: any, index: number }) => {
    // Lógica Freemium: Muestra los 2 primeros si es free, bloquea el resto
    if (!isPremium && index >= 2) {
      return <LockedListItem title={item.nombre} onUpgrade={handleUpgrade} />;
    }

    return (
      <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 ml-4 mr-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-lg font-bold text-gray-800 flex-1">{item.nombre}</Text>
          <View className="bg-blue-100 px-2 py-1 rounded">
            <Text className="text-blue-800 font-semibold text-xs">Cant: {item.cantidad_sugerida}</Text>
          </View>
        </View>
        {item.descripcion && (
          <Text className="text-sm text-gray-600 mt-1">{item.descripcion}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={procedimientos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderProcedimiento}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">
            No hay procedimientos registrados para este instrumento.
          </Text>
        }
      />
    </View>
  );
}
