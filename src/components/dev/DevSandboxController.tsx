import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { SEED_TIEMPOS_QUIRURGICOS } from '../../database/schema';
import { useDevConfigStore } from '../../store/useDevConfigStore';

const COLOR_PRESETS = [
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Rose', hex: '#E11D48' },
];

export function DevSandboxController() {
  const [expanded, setExpanded] = useState(false);
  const db = useSQLiteContext();
  
  // Consumo del motor dinámico
  const config = useDevConfigStore();

  // Aislar de producción estrictamente
  if (!__DEV__) return null;

  // Zero Trust Visual: Si está en Preview Mode, ocultar panel completo.
  if (config.isPreviewMode) {
    return (
      <TouchableOpacity 
        className="absolute top-12 right-2 bg-black/30 rounded-full w-8 h-8 justify-center items-center z-50"
        onLongPress={() => config.setPreviewMode(false)}
        delayLongPress={800}
      >
        <Text className="text-white text-[8px] font-bold">DEV</Text>
      </TouchableOpacity>
    );
  }

  const handlePurgeDB = async () => {
    try {
      await db.execAsync(`
        DELETE FROM relacion_procedimiento_instrumento;
        DELETE FROM procedimientos;
        DELETE FROM instrumentos;
        DELETE FROM tiempos_quirurgicos;
      `);
      Alert.alert("Purgado", "Base de datos limpiada correctamente.");
    } catch (e: any) {
      Alert.alert("Error purgado", e.message);
    }
  };

  const handleForceSeed = async () => {
    try {
      await db.execAsync(SEED_TIEMPOS_QUIRURGICOS);
      await db.execAsync(`
        INSERT INTO instrumentos (id, nombre, descripcion, imagen_url, tiempo_quirurgico_id) 
        VALUES (999, 'Bisturí Dummy (Dev)', 'Instrumento inyectado.', 'https://placehold.co/150x150/png', 1)
        ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre;
      `);
      Alert.alert("Seed Forzado", "Datos dummy inyectados (ID 999).");
    } catch (e: any) {
      Alert.alert("Error inyectando", e.message);
    }
  };

  if (!expanded) {
    return (
      <TouchableOpacity 
        className="absolute top-12 right-4 bg-purple-600 rounded-full w-12 h-12 justify-center items-center shadow-lg z-50 border-2 border-white"
        onPress={() => setExpanded(true)}
      >
        <Text className="text-white font-bold text-xs">DEV</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="absolute top-12 right-4 bg-gray-900 p-4 rounded-xl shadow-xl z-50 border border-gray-700 w-72 max-h-[80%]">
      <View className="flex-row justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <Text className="font-extrabold text-purple-400">🛠 Sandbox Live Editor</Text>
        <TouchableOpacity onPress={() => setExpanded(false)} className="p-1">
          <Text className="text-gray-400 font-bold">X</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Editor de Tema */}
        <Text className="text-gray-300 font-bold text-xs uppercase mb-2">Tema Primario</Text>
        <View className="flex-row justify-between mb-4">
          {COLOR_PRESETS.map(c => (
            <TouchableOpacity 
              key={c.hex}
              onPress={() => config.setTheme({ primaryColor: c.hex })}
              style={{ backgroundColor: c.hex }}
              className={`w-10 h-10 rounded-full border-2 ${config.theme.primaryColor === c.hex ? 'border-white' : 'border-transparent'}`}
            />
          ))}
        </View>

        {/* Editor de Tiempos */}
        <Text className="text-gray-300 font-bold text-xs uppercase mb-2">Transición Quiz (ms)</Text>
        <View className="flex-row justify-between items-center bg-gray-800 rounded-lg p-2 mb-4">
          <TouchableOpacity onPress={() => config.setTimers({ quizTransitionMs: Math.max(500, config.timers.quizTransitionMs - 500) })}>
            <Text className="text-white font-bold px-3 py-1 bg-gray-700 rounded">-</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold">{config.timers.quizTransitionMs}ms</Text>
          <TouchableOpacity onPress={() => config.setTimers({ quizTransitionMs: config.timers.quizTransitionMs + 500 })}>
            <Text className="text-white font-bold px-3 py-1 bg-gray-700 rounded">+</Text>
          </TouchableOpacity>
        </View>

        {/* Perspectiva de Usuario */}
        <TouchableOpacity 
          className="bg-purple-600 py-3 px-3 rounded-lg mb-4 mt-2 shadow-lg flex-row justify-center items-center"
          onPress={() => {
            setExpanded(false);
            config.setPreviewMode(true);
            Alert.alert("Modo Perspectiva", "Mantén presionado el botón gris arriba a la derecha para volver a Dev.");
          }}
        >
          <Text className="text-white text-center font-bold text-sm">👁 Guardar & Ver Perspectiva</Text>
        </TouchableOpacity>

        {/* Base de Datos (Ocultable) */}
        {config.content.allowDummyDataInjection && (
          <View className="border-t border-gray-700 pt-3">
            <Text className="text-gray-400 font-bold text-xs uppercase mb-2">Base de Datos</Text>
            
            <TouchableOpacity 
              className="bg-yellow-500/20 border border-yellow-500/50 py-2 px-3 rounded-lg mb-2"
              onPress={() => {
                import('../../store/mmkvStorage').then(({ mmkvInstance }) => {
                  mmkvInstance.set('isDatabaseSeeded', false);
                  handlePurgeDB().then(() => {
                    Alert.alert("Re-Seed Activado", "Se reinició MMKV. Recarga la app (Cmd+R o r en terminal) para inyectar el catálogo maestro de nuevo.");
                  });
                });
              }}
            >
              <Text className="text-yellow-400 text-center font-bold text-sm">⚠️ Forzar Re-Seed Completo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-red-500/20 border border-red-500/50 py-2 px-3 rounded-lg mb-2"
              onPress={handlePurgeDB}
            >
              <Text className="text-red-400 text-center font-bold text-sm">🔥 Purgar SQLite</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-green-500/20 border border-green-500/50 py-2 px-3 rounded-lg mb-2"
              onPress={handleForceSeed}
            >
              <Text className="text-green-400 text-center font-bold text-sm">💉 Inyectar Dummy JSON</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
