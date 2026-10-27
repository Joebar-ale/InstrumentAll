import "./global.css";
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { migrateDbIfNeeded } from './src/database/database';
import { useConnectivity } from './src/hooks/useConnectivity';
import { initializeAds } from './src/services/adService';
import { DATABASE_NAME } from './src/constants/config';
import { BottomBannerAd } from './src/components/ads/BottomBannerAd';
import { DevSandboxController } from './src/components/dev/DevSandboxController';

import { CatalogoHubScreen } from './src/screens/CatalogoHubScreen';
import { CatalogoScreen } from './src/screens/CatalogoScreen';
import { CatalogoProcedimientosScreen } from './src/screens/CatalogoProcedimientosScreen';
import { InstrumentDetailScreen } from './src/screens/InstrumentDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

import { StudyHubScreen } from './src/screens/StudyHubScreen';
import { FlashcardsScreen } from './src/screens/FlashcardsScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { PizarraScreen } from './src/screens/PizarraScreen';
import { SimuladorMesaScreen } from './src/screens/SimuladorMesaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// === Stacks de cada pestaña ===

function CatalogoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CatalogoHub" component={CatalogoHubScreen} options={{ title: 'Bibliotecas' }} />
      <Stack.Screen name="CatalogoInstrumentos" component={CatalogoScreen} options={{ title: 'Instrumentos' }} />
      <Stack.Screen name="CatalogoProcedimientos" component={CatalogoProcedimientosScreen} options={{ title: 'Procedimientos' }} />
      <Stack.Screen name="Detalle" component={InstrumentDetailScreen} />
      <Stack.Screen name="Ajustes" component={SettingsScreen} options={{ title: 'Perfil y Ajustes' }} />
    </Stack.Navigator>
  );
}

function EstudioStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StudyHub" component={StudyHubScreen} options={{ title: 'Hub de Estudio' }} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{ title: 'Flashcards' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="Pizarra" component={PizarraScreen} options={{ title: 'Pizarra Interactiva' }} />
      <Stack.Screen name="SimuladorMesa" component={SimuladorMesaScreen} options={{ title: 'Simulador de Mesa' }} />
      <Stack.Screen name="Ajustes" component={SettingsScreen} options={{ title: 'Perfil y Ajustes' }} />
    </Stack.Navigator>
  );
}

import { useDatabaseInit } from './src/store/useDatabaseInit';
import { ActivityIndicator, Text } from 'react-native';
import { useDevConfigStore } from './src/store/useDevConfigStore';
import * as ScreenCapture from 'expo-screen-capture';

// === Root de la App ===

function RootApp() {
  const { theme } = useDevConfigStore();
  const { isInitializing, error } = useDatabaseInit();

  // Listeners de conectividad globales
  useConnectivity();

  useEffect(() => {
    // Inicializar SDK de AdMob
    initializeAds();
    // Bloquear capturas de pantalla globalmente
    ScreenCapture.preventScreenCaptureAsync();
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundColor }}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={{ marginTop: 16, color: '#4B5563', fontWeight: 'bold' }}>Preparando el quirófano...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Error inicializando la app:</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563EB' }}>
          <Tab.Screen 
            name="TabCatalogo" 
            component={CatalogoStack} 
            options={{ tabBarLabel: 'Catálogo', tabBarIcon: () => <View className="w-5 h-5 bg-blue-500 rounded-sm" /> }} 
          />
          <Tab.Screen 
            name="TabEstudio" 
            component={EstudioStack} 
            options={{ tabBarLabel: 'Estudio', tabBarIcon: () => <View className="w-5 h-5 bg-green-500 rounded-full" /> }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
      
      {/* Controladores Flotantes y Ads */}
      <DevSandboxController />
      <BottomBannerAd />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <RootApp />
    </SQLiteProvider>
  );
}
