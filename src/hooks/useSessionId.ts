
import { useState, useEffect } from 'react';

export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const generateSessionId = (): string => {
    // Usar crypto.randomUUID() para garantir unicidade real
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}`;
    }
    // Fallback mais robusto
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substr(2, 15);
    const random2 = Math.random().toString(36).substr(2, 15);
    return `session_${timestamp}_${random1}${random2}`;
  };

  const initializeSessionId = () => {
    console.log('🔧 Inicializando session_id...');
    
    // Sempre gerar novo session_id para evitar sobreposição
    const newSessionId = generateSessionId();
    console.log('🆕 Novo session_id gerado:', newSessionId);
    
    // Validação síncrona antes de salvar
    if (!newSessionId || newSessionId.length < 10) {
      console.error('❌ Session ID inválido gerado, tentando novamente...');
      const retrySessionId = generateSessionId();
      setSessionId(retrySessionId);
      localStorage.setItem('current_briefing_session_id', retrySessionId);
    } else {
      setSessionId(newSessionId);
      localStorage.setItem('current_briefing_session_id', newSessionId);
    }
    
    setIsInitialized(true);
  };

  const clearSessionId = () => {
    console.log('🗑️ Limpando session_id...');
    localStorage.removeItem('current_briefing_session_id');
    setSessionId('');
    setIsInitialized(false);
  };

  const validateSessionId = (id: string): boolean => {
    return id && id.length > 10 && id.includes('session_');
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
    validateSessionId,
    regenerateSessionId: () => {
      console.log('🔄 Regenerando session_id...');
      clearSessionId();
      setTimeout(() => initializeSessionId(), 100);
    }
  };
};
