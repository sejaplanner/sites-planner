
import { useState, useEffect } from 'react';

export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const generateSessionId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  };

  const initializeSessionId = () => {
    console.log('🔧 Inicializando session_id...');
    
    // Sempre gerar novo session_id para evitar sobreposição de dados
    const newSessionId = generateSessionId();
    console.log('🆕 Novo session_id gerado:', newSessionId);
    
    // Salvar no localStorage
    const storageKey = 'current_briefing_session_id';
    localStorage.setItem(storageKey, newSessionId);
    setSessionId(newSessionId);
    setIsInitialized(true);
  };

  const clearSessionId = () => {
    console.log('🗑️ Limpando session_id...');
    localStorage.removeItem('current_briefing_session_id');
    setSessionId('');
    setIsInitialized(false);
  };

  useEffect(() => {
    if (!isInitialized) {
      initializeSessionId();
    }
  }, [isInitialized]);

  return {
    sessionId,
    isInitialized,
    clearSessionId,
    regenerateSessionId: () => {
      console.log('🔄 Regenerando session_id...');
      clearSessionId();
      initializeSessionId();
    }
  };
};
