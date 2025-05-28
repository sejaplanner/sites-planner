
import { useState, useEffect } from 'react';

interface PersistedData {
  sessionId: string;
  messages: any[];
  collectedData: any;
  lastActivity: number;
}

export const usePersistence = (sessionId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [persistedData, setPersistedData] = useState<PersistedData | null>(null);

  const STORAGE_KEY = `briefing_session_${sessionId}`;

  const saveToStorage = (data: Partial<PersistedData>) => {
    try {
      console.log('💾 Salvando no localStorage:', {
        sessionId: data.sessionId,
        messagesCount: data.messages?.length || 0,
        timestamp: new Date().toISOString()
      });

      const updatedData = {
        sessionId: sessionId,
        messages: data.messages || [],
        collectedData: data.collectedData || {},
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
      
      // Para nova sessão, não carregar dados antigos
      if (!sessionId || sessionId.trim() === '') {
        console.log('ℹ️ Session ID vazio, não carregando dados antigos');
        return null;
      }
      
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('ℹ️ Nenhum dado encontrado no localStorage para esta sessão');
        return null;
      }
      
      const parsed = JSON.parse(data);
      
      // Verificar se é da mesma sessão
      if (parsed.sessionId !== sessionId) {
        console.log('⚠️ SessionId não corresponde, dados são de outra sessão');
        localStorage.removeItem(STORAGE_KEY);
        return null;
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
