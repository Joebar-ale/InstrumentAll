import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { QUERY_SIMULADOR_MESA } from '../database/schema';
import { DraggableInstrument } from '../components/simulador/DraggableInstrument';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useDevConfigStore } from '../store/useDevConfigStore';
import type { Instrumento } from '../types';

export function SimuladorMesaScreen() {
  const db = useSQLiteContext();
  const { triggerAdIfFree, loadAd } = useInterstitialAd();

  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [lockedIds, setLockedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [flashError, setFlashError] = useState(false);
  const { theme, timers } = useDevConfigStore();

  useEffect(() => {
    loadAd();
    loadMesa();
  }, []);

  const loadMesa = async () => {
    try {
      setLoading(true);
      const result = await db.getAllAsync<Instrumento>(QUERY_SIMULADOR_MESA);
      setInstrumentos(result);
      setLockedIds(new Set());
      setErrors(0);
      setStartTime(Date.now());
      setEndTime(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (id: number) => {
    setLockedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      
      // Si completó los 4 instrumentos
      if (newSet.size === instrumentos.length) {
        setEndTime(Date.now());
        triggerAdIfFree();
      }
      
      return newSet;
    });
  };

  const handleError = () => {
    setErrors(prev => prev + 1);
    setFlashError(true);
    setTimeout(() => setFlashError(false), 300);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const isFinished = lockedIds.size === instrumentos.length && endTime !== null;
  const timeTakenStr = isFinished ? ((endTime - startTime) / 1000).toFixed(1) : "0.0";
  const timeExceeded = isFinished && ((endTime - startTime) / 1000) > timers.tableSimulatorMaxTime;

  return (
    <View className="flex-1 bg-gray-100">
      
      {flashError && (
        <View className="absolute inset-0 bg-red-500/30 z-50" pointerEvents="none" />
      )}

      {/* Mitad Superior: La Mesa (Drop Zone) */}
      <View className="h-1/2 flex-row flex-wrap bg-teal-50 relative">
        {/* Cuadrante 1: Diéresis (Top-Left) */}
        <View className="w-1/2 h-1/2 border-r border-b border-teal-200 justify-center items-center opacity-30">
          <Text className="font-bold text-teal-800">1. Diéresis</Text>
        </View>
        {/* Cuadrante 2: Hemostasia (Top-Right) */}
        <View className="w-1/2 h-1/2 border-b border-teal-200 justify-center items-center opacity-30">
          <Text className="font-bold text-teal-800">2. Hemostasia</Text>
        </View>
        {/* Cuadrante 3: Tracción (Bottom-Left) */}
        <View className="w-1/2 h-1/2 border-r border-teal-200 justify-center items-center opacity-30">
          <Text className="font-bold text-teal-800">3. Tracción</Text>
        </View>
        {/* Cuadrante 4: Síntesis (Bottom-Right) */}
        <View className="w-1/2 h-1/2 justify-center items-center opacity-30">
          <Text className="font-bold text-teal-800">4. Síntesis</Text>
        </View>
      </View>

      {/* Mitad Inferior: Drag Zone y Caja de Instrumentos */}
      <View className="h-1/2 bg-gray-100 p-6 items-center">
        <Text className="text-gray-500 font-bold mb-4 uppercase tracking-wider text-xs">
          Caja de Instrumentos
        </Text>
        
        <View className="flex-row flex-wrap justify-center w-full z-10">
          {instrumentos.map((inst) => (
            <DraggableInstrument 
              key={inst.id}
              instrumento={inst}
              isLocked={lockedIds.has(inst.id)}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ))}
        </View>
      </View>

      {/* Modal / Overlay de Éxito */}
      {isFinished && (
        <View className="absolute inset-0 bg-black/60 justify-center items-center z-50 px-4">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-2xl">
            <Text className="text-5xl mb-4">🩺</Text>
            <Text className="text-2xl font-black text-gray-800 mb-2 text-center">¡Mesa Armada!</Text>
            
            <View className="w-full bg-gray-50 rounded-xl p-4 my-4 border border-gray-100">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 font-bold">Tiempo:</Text>
                <Text className={`font-bold ${timeExceeded ? 'text-red-500' : 'text-blue-600'}`}>{timeTakenStr}s</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 font-bold">Errores:</Text>
                <Text className="text-red-500 font-bold">{errors}</Text>
              </View>
              {timeExceeded && (
                <Text className="text-red-500 text-xs text-center mt-2 font-semibold">
                  (Superaste el tiempo ideal de {timers.tableSimulatorMaxTime}s)
                </Text>
              )}
            </View>

            <TouchableOpacity 
              className="w-full py-4 rounded-xl items-center"
              style={{ backgroundColor: theme.primaryColor }}
              onPress={loadMesa}
            >
              <Text className="text-white font-bold text-lg">Nueva Mesa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}
