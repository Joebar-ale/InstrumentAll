import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

interface Procedimiento {
  id: number;
  nombre: string;
  descripcion: string;
}

export function CatalogoProcedimientosScreen() {
  const db = useSQLiteContext();
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await db.getAllAsync<Procedimiento>('SELECT * FROM procedimientos ORDER BY nombre ASC');
        setProcedimientos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={procedimientos}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
            <Text className="text-xl font-bold text-gray-800 mb-2">{item.nombre}</Text>
            <Text className="text-gray-600">{item.descripcion}</Text>
          </View>
        )}
      />
    </View>
  );
}
