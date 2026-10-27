import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Canvas, Path, Skia, SkPath } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { DraggableText, TextNode } from '../components/pizarra/DraggableText';
import { DraggableImage, ImageNode } from '../components/pizarra/DraggableImage';

export function PizarraScreen({ navigation }: any) {
  const { triggerAdIfFree } = useInterstitialAd();
  
  // Modos y Estado Híbrido
  const [drawingMode, setDrawingMode] = useState(false);
  const [paths, setPaths] = useState<string[]>([]); // Guardamos SVG Strings para no saturar JSI
  const [nodes, setNodes] = useState<TextNode[]>([]);
  const [images, setImages] = useState<ImageNode[]>([]);
  
  // Limites Zero Trust
  const MAX_NODES = 30;
  const MAX_IMAGES = 10;

  // Trazo actual (Referencia Mutable para rendimiento)
  const currentPath = useRef<SkPath | null>(null);
  const [, setTick] = useState(0); // Para forzar re-render en el trazo activo

  // ============================================
  // GESTO: Dibujar en Skia (Fondo)
  // ============================================
  const bgGesture = Gesture.Pan().runOnJS(true)
    .enabled(drawingMode)
    .onStart((e) => {
      const path = Skia.Path.Make();
      path.moveTo(e.x, e.y);
      currentPath.current = path;
      setTick(t => t + 1);
    })
    .onUpdate((e) => {
      if (currentPath.current) {
        currentPath.current.lineTo(e.x, e.y);
        setTick(t => t + 1);
      }
    })
    .onEnd(() => {
      if (currentPath.current) {
        setPaths(prev => [...prev, currentPath.current!.toSVGString()]);
        currentPath.current = null;
        setTick(t => t + 1);
      }
    });

  // ============================================
  // HERRAMIENTAS
  // ============================================
  const addTextNode = () => {
    if (nodes.length >= MAX_NODES) {
      Alert.alert("Límite Alcanzado", `No puedes añadir más de ${MAX_NODES} notas de texto.`);
      return;
    }
    const newNode: TextNode = {
      id: Date.now().toString(),
      text: "",
      x: 100,
      y: 100,
    };
    setNodes([...nodes, newNode]);
    setDrawingMode(false); // Apagar dibujo para poder arrastrar
  };

  const addImageNode = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Límite Alcanzado", `No puedes añadir más de ${MAX_IMAGES} imágenes.`);
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage: ImageNode = {
        id: Date.now().toString(),
        uri: asset.uri,
        x: 50,
        y: 50,
        width: 150,
        height: 150 * (asset.height / asset.width), // Mantener aspect ratio
      };
      setImages([...images, newImage]);
      setDrawingMode(false);
    }
  };

  const updateText = (id: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const viewShotRef = useRef<any>(null);
  
  const handleExport = async () => {
    if (viewShotRef.current) {
      try {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Error", "La exportación no está disponible en este dispositivo.");
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "No se pudo exportar la pizarra.");
      }
    }
  };

  const handleFinish = () => {
    triggerAdIfFree();
    navigation.goBack();
  };

  // Convertimos los SVG strings guardados de nuevo a SkPath para renderizarlos
  const renderedPaths = paths.map(svg => Skia.Path.MakeFromSVGString(svg)).filter(Boolean) as SkPath[];

  return (
    <View className="flex-1 bg-white">
      {/* Header Híbrido */}
      <View className="flex-row justify-between items-center bg-gray-50 pt-12 pb-4 px-4 border-b border-gray-200 z-50">
        <Text className="text-xl font-black text-gray-800">Pizarra Interactiva</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={handleFinish}
        >
          <Text className="text-white font-bold">Finalizar Práctica</Text>
        </TouchableOpacity>
      </View>

      {/* ZONA DEL LIENZO */}
      <View className="flex-1 relative overflow-hidden">
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ flex: 1 }}>
          
          {/* SKIA CANVAS (Capa Base) */}
          <GestureDetector gesture={bgGesture}>
            <View className="absolute inset-0">
              <Canvas style={{ flex: 1 }}>
                {/* Trazos Guardados */}
                {renderedPaths.map((p, index) => (
                  <Path key={index} path={p} color="#3B82F6" style="stroke" strokeWidth={4} strokeCap="round" />
                ))}
                {/* Trazo Activo */}
                {currentPath.current && (
                  <Path path={currentPath.current} color="#3B82F6" style="stroke" strokeWidth={4} strokeCap="round" />
                )}
              </Canvas>
            </View>
          </GestureDetector>

          {/* NODOS DE IMÁGENES (Capa Media) */}
          {images.map(img => (
            <DraggableImage key={img.id} node={img} />
          ))}

          {/* NODOS DE TEXTO (Capa Superior) */}
          {nodes.map(node => (
            <DraggableText key={node.id} node={node} onUpdateText={updateText} />
          ))}
          
        </ViewShot>
      </View>

      {/* PANEL DE HERRAMIENTAS (Bottom) */}
      <View className="flex-row justify-around items-center bg-white py-6 px-4 border-t border-gray-200 z-50">
        
        <TouchableOpacity 
          className={`px-4 py-3 rounded-xl border-2 ${drawingMode ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-transparent'}`}
          onPress={() => setDrawingMode(true)}
        >
          <Text className={`font-bold ${drawingMode ? 'text-blue-700' : 'text-gray-600'}`}>
            ✏️ Lápiz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-transparent"
          onPress={addTextNode}
        >
          <Text className="font-bold text-gray-600">📝 Texto</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="px-4 py-3 rounded-xl bg-gray-100 border-2 border-transparent"
          onPress={addImageNode}
        >
          <Text className="font-bold text-gray-600">🖼️ Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="px-4 py-3 rounded-xl bg-green-100 border-2 border-green-500"
          onPress={handleExport}
        >
          <Text className="font-bold text-green-700">📤 Compartir</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
