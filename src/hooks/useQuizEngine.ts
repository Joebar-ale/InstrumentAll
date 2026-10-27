import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { QUERY_QUIZ_PREGUNTAS, QUERY_QUIZ_DISTRACTORES } from '../database/schema';

export interface QuizQuestion {
  id: number;
  correctName: string;
  imageUrl: string | null;
  options: string[];
}

export function useQuizEngine() {
  const db = useSQLiteContext();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener 10 instrumentos correctos
      const correctas = await db.getAllAsync<{ id: number; nombre: string; imagen_url: string | null }>(
        QUERY_QUIZ_PREGUNTAS
      );
      
      // 2. Por cada correcto, buscar 3 distractores
      const fullQuestions = await Promise.all(
        correctas.map(async (inst) => {
          const distractores = await db.getAllAsync<{ nombre: string }>(
            `SELECT nombre FROM instrumentos WHERE id != ${inst.id} ORDER BY RANDOM() LIMIT 3`
          );
          
          const opciones = [inst.nombre, ...distractores.map(d => d.nombre)];
          
          // 3. Mezclar las opciones (Fisher-Yates Shuffle)
          for (let i = opciones.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
          }
          
          return {
            id: inst.id,
            correctName: inst.nombre,
            imageUrl: inst.imagen_url,
            options: opciones
          };
        })
      );
      
      setQuestions(fullQuestions);
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  return { questions, loading, loadQuiz };
}
