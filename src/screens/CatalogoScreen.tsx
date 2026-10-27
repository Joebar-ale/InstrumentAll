import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { QUERY_INSTRUMENTOS_AGRUPADOS } from '../database/schema';
import type { InstrumentoConTiempo, InstrumentoSection } from '../types';
import { InstrumentCard } from '../components/cards/InstrumentCard';
import { useOfflineGuard } from '../hooks/useOfflineGuard';
import { EnergyDepletedModal } from '../components/modals/EnergyDepletedModal';

export function CatalogoScreen({ navigation }: any) {
  const db = useSQLiteContext();
  const [sections, setSections] = useState<InstrumentoSection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Guardia offline (maneja lógica Freemium y energía)
  const { canBrowse, isBlocked, consumeIfNeeded } = useOfflineGuard();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await db.getAllAsync<InstrumentoConTiempo & { orden_sugerido_mesa: number }>(
        QUERY_INSTRUMENTOS_AGRUPADOS
      );
      
      // Agrupar los resultados planos en formato SectionList
      const grouped = result.reduce((acc, current) => {
        const section = acc.find(s => s.title === current.tiempo_nombre);
        const instrumento = {
          id: current.id,
          nombre: current.nombre,
          descripcion: current.descripcion,
          imagen_url: current.imagen_url,
          tiempo_quirurgico_id: current.tiempo_quirurgico_id
        };
        
        if (section) {
          section.data.push(instrumento);
        } else {
          acc.push({
            title: current.tiempo_nombre,
            ordenMesa: current.orden_sugerido_mesa,
            data: [instrumento]
          });
        }
        return acc;
      }, [] as InstrumentoSection[]);
      
      setSections(grouped);
    } catch (e) {
      console.error("Error cargando instrumentos de SQLite:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (instrumento: any) => {
    if (canBrowse) {
      // Consume 1 uso offline si aplica (usuario free + sin internet)
      consumeIfNeeded(); 
      navigation.navigate('Detalle', { instrumento });
    }
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        // Espacio al final para que el BottomBannerAd flotante no tape contenido
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <InstrumentCard instrumento={item} onPress={() => handlePress(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-xl font-extrabold text-blue-900 bg-gray-50 py-2 mt-4 mb-2">
            {title}
          </Text>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            Aún no hay instrumentos en la base de datos local.
          </Text>
        }
      />
      
      <EnergyDepletedModal 
        visible={isBlocked} 
        onRequestPremium={() => navigation.navigate('Ajustes')} 
      />
    </View>
  );
}
