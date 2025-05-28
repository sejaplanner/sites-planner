
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
    
    // Tentar recuperar do localStorage primeiro
    const storageKey = 'current_briefing_session_id';
    const storedSessionId = localStorage.getItem(storageKey);
    
    if (storedSessionId && storedSessionId.trim() !== '') {
      console.log('✅ Session_id recuperado do localStorage:', storedSessionId);
      setSessionId(storedSessionId);
    } else {
      // Gerar novo session_id
      const newSessionId = generateSessionId();
      console.log('🆕 Novo session_id gerado:', newSessionId);
      
      // Salvar no localStorage
      localStorage.setItem(storageKey, newSessionId);
      setSessionId(newSessionId);
    }
    
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
