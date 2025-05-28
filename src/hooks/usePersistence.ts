
import { useState, useEffect } from 'react';

interface PersistedData {
  sessionId: string;
  messages: any[];
  collectedData: any;
  currentBlock: number;
  currentProgress: number;
  lastActivity: number;
}

export const usePersistence = (sessionId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [persistedData, setPersistedData] = useState<PersistedData | null>(null);

  const STORAGE_KEY = `briefing_session_${sessionId}`;
  const ACTIVITY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 horas em milliseconds

  const saveToStorage = (data: Partial<PersistedData>) => {
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const existingData = currentData ? JSON.parse(currentData) : {};
      
      const updatedData = {
        ...existingData,
        ...data,
        lastActivity: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setPersistedData(updatedData);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const loadFromStorage = (): PersistedData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      const now = Date.now();
      
      // Verificar se os dados não são muito antigos (mais de 7 dias)
      if (parsed.lastActivity && (now - parsed.lastActivity) > (7 * 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPersistedData(null);
  };

  useEffect(() => {
    const loaded = loadFromStorage();
    setPersistedData(loaded);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    persistedData,
    saveToStorage,
    loadFromStorage,
    clearStorage
  };
};
