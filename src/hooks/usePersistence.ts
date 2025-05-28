
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
      console.log('💾 Salvando no localStorage:', {
        sessionId: data.sessionId,
        messagesCount: data.messages?.length || 0,
        timestamp: new Date().toISOString()
      });

      const currentData = localStorage.getItem(STORAGE_KEY);
      const existingData = currentData ? JSON.parse(currentData) : {};
      
      const updatedData = {
        ...existingData,
        ...data,
        sessionId: sessionId, // Garantir que o sessionId está correto
        lastActivity: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setPersistedData(updatedData);
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  };

  const loadFromStorage = (): PersistedData | null => {
    try {
      console.log('🔄 Carregando do localStorage para sessão:', sessionId);
      
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('ℹ️ Nenhum dado encontrado no localStorage para esta sessão');
        return null;
      }
      
      const parsed = JSON.parse(data);
      const now = Date.now();
      
      // Verificar se os dados não são muito antigos (mais de 7 dias)
      if (parsed.lastActivity && (now - parsed.lastActivity) > (7 * 24 * 60 * 60 * 1000)) {
        console.log('🗑️ Dados antigos encontrados, removendo...');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Verificar se o sessionId corresponde
      if (parsed.sessionId && parsed.sessionId !== sessionId) {
        console.log('⚠️ SessionId não corresponde, dados podem ser de outra sessão');
        // Não remover, pois pode ser válido
      }
      
      console.log('✅ Dados carregados do localStorage:', {
        sessionId: parsed.sessionId,
        messagesCount: parsed.messages?.length || 0,
        lastActivity: new Date(parsed.lastActivity).toISOString()
      });

      return parsed;
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      return null;
    }
  };

  const clearStorage = () => {
    console.log('🗑️ Limpando localStorage para sessão:', sessionId);
    localStorage.removeItem(STORAGE_KEY);
    setPersistedData(null);
  };

  useEffect(() => {
    if (sessionId && sessionId.trim() !== '') {
      console.log('🔧 Inicializando persistência para sessão:', sessionId);
      const loaded = loadFromStorage();
      setPersistedData(loaded);
    }
    setIsLoading(false);
  }, [sessionId]);

  return {
    isLoading,
    persistedData,
    saveToStorage,
    loadFromStorage,
    clearStorage
  };
};
