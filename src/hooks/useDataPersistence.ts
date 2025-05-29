
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from './useChatState';

interface CollectedData {
  session_id: string;
  user_name?: string;
  user_whatsapp?: string;
  company_name?: string;
  slogan?: string;
  mission?: string;
  vision?: string;
  values?: string;
  description?: string;
  differentials?: string;
  products_services?: string;
  target_audience?: string;
  social_proof?: string;
  design_preferences?: string;
  contact_info?: string;
  website_objective?: string;
  additional_info?: string;
  uploaded_files?: string[];
  conversation_log: any[];
  historico_conversa?: any[];
  evaluation_comment?: string;
  status: 'in_progress' | 'completed';
  created_at: string;
}

export const useDataPersistence = (sessionId: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Backup local melhorado
  const createLocalBackup = useCallback((data: any) => {
    try {
      const backupData = {
        ...data,
        backupTimestamp: new Date().toISOString(),
        version: '2.0'
      };
      
      localStorage.setItem(`briefing_backup_${sessionId}`, JSON.stringify(backupData));
      
      // Também salvar no IndexedDB como fallback adicional
      if ('indexedDB' in window) {
        const request = indexedDB.open('BriefingBackup', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['backups'], 'readwrite');
          const store = transaction.objectStore('backups');
          store.put({ id: sessionId, data: backupData });
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', { keyPath: 'id' });
          }
        };
      }
      
      console.log('💾 Backup local criado:', {
        sessionId,
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar backup local:', error);
    }
  }, [sessionId]);

  // Salvamento robusto com retry
  const saveToDatabase = useCallback(async (data: Partial<CollectedData>, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Backoff exponencial

    if (!data.session_id || data.session_id.length < 10) {
      console.error('❌ Session ID inválido:', data.session_id);
      return false;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      console.log(`🔄 SALVAMENTO TENTATIVA ${retryCount + 1}/${maxRetries}:`, {
        sessionId: data.session_id,
        timestamp: new Date().toISOString(),
        dataKeys: Object.keys(data),
        conversationLength: data.historico_conversa?.length || 0
      });

      // Verificar se já existe
      const { data: existingData, error: selectError } = await supabase
        .from('client_briefings')
        .select('id, session_id, created_at')
        .eq('session_id', data.session_id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erro ao verificar dados existentes:', selectError);
        throw selectError;
      }

      const dataToSave = {
        session_id: data.session_id,
        user_name: data.user_name || null,
        user_whatsapp: data.user_whatsapp || null,
        company_name: data.company_name || null,
        slogan: data.slogan || null,
        mission: data.mission || null,
        vision: data.vision || null,
        values: data.values || null,
        description: data.description || null,
        differentials: data.differentials || null,
        products_services: data.products_services || null,
        target_audience: data.target_audience || null,
        social_proof: data.social_proof || null,
        design_preferences: data.design_preferences || null,
        contact_info: data.contact_info || null,
        website_objective: data.website_objective || null,
        additional_info: data.additional_info || null,
        uploaded_files: data.uploaded_files || [],
        conversation_log: data.conversation_log || [],
        historico_conversa: data.historico_conversa || [],
        evaluation_comment: data.evaluation_comment || null,
        status: data.status || 'in_progress',
        updated_at: new Date().toISOString()
      };

      if (existingData) {
        console.log('📝 Atualizando registro existente:', existingData.id);
        
        const { error: updateError } = await supabase
          .from('client_briefings')
          .update(dataToSave)
          .eq('session_id', data.session_id);

        if (updateError) throw updateError;
      } else {
        console.log('🆕 Criando novo registro...');
        
        const { error: insertError } = await supabase
          .from('client_briefings')
          .insert({
            ...dataToSave,
            created_at: data.created_at || new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Backup local após sucesso
      createLocalBackup(data);
      
      setLastSaveTime(new Date());
      setSaveStatus('success');
      
      console.log('✅ DADOS SALVOS COM SUCESSO:', {
        sessionId: data.session_id,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });

      // Reset status após 2 segundos
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      return true;

    } catch (error) {
      console.error('❌ ERRO NO SALVAMENTO:', {
        error,
        sessionId: data.session_id,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });
      
      // Backup local em caso de erro
      createLocalBackup(data);
      
      if (retryCount < maxRetries - 1) {
        console.log(`🔄 Retry em ${retryDelay}ms... (tentativa ${retryCount + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return saveToDatabase(data, retryCount + 1);
      }
      
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return false;
      
    } finally {
      setIsSaving(false);
    }
  }, [createLocalBackup]);

  // Salvamento contínuo da conversa
  const saveConversation = useCallback(async (messages: Message[], uploadedFiles: string[] = []): Promise<boolean> => {
    const historico = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      files: msg.files?.map(f => f.name) || [],
      hasAudio: !!msg.audioBlob
    }));

    const dataToSave: Partial<CollectedData> = {
      session_id: sessionId,
      historico_conversa: historico,
      conversation_log: historico,
      uploaded_files: uploadedFiles,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };

    return await saveToDatabase(dataToSave);
  }, [sessionId, saveToDatabase]);

  // Análise e salvamento final
  const analyzeAndSave = useCallback(async (messages: Message[]): Promise<boolean> => {
    try {
      console.log('🔍 Iniciando análise final da conversa...');
      
      const historico = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        files: msg.files?.map(f => f.name) || [],
        hasAudio: !!msg.audioBlob
      }));

      console.log('📊 Enviando para análise:', {
        sessionId,
        messagesCount: historico.length,
        timestamp: new Date().toISOString()
      });

      const { data: responseData, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          historico_conversa: historico,
          session_id: sessionId
        }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(`Erro na análise: ${error.message}`);
      }
      
      if (!responseData.success) {
        console.error('❌ Edge Function retornou erro:', responseData.error);
        throw new Error(responseData.error || 'Erro na análise');
      }

      console.log('✅ Dados analisados pela IA:', responseData.data);

      // Limpar e estruturar dados
      const analyzedData: Partial<CollectedData> = {
        session_id: sessionId,
        user_name: responseData.data.user_name || null,
        user_whatsapp: responseData.data.user_whatsapp ? 
          responseData.data.user_whatsapp.replace(/[^\d]/g, '') : null,
        company_name: responseData.data.company_name || null,
        slogan: responseData.data.slogan || null,
        mission: responseData.data.mission || null,
        vision: responseData.data.vision || null,
        values: responseData.data.values || null,
        description: responseData.data.description || null,
        differentials: responseData.data.differentials || null,
        products_services: responseData.data.products_services || null,
        target_audience: responseData.data.target_audience || null,
        social_proof: responseData.data.social_proof || null,
        design_preferences: responseData.data.design_preferences || null,
        contact_info: responseData.data.contact_info || null,
        website_objective: responseData.data.website_objective || null,
        additional_info: responseData.data.additional_info || null,
        historico_conversa: historico,
        conversation_log: historico,
        status: 'completed' as const,
        created_at: new Date().toISOString()
      };

      console.log('✅ Salvando dados analisados...');
      const success = await saveToDatabase(analyzedData);
      
      if (success) {
        console.log('✅ Análise e salvamento concluídos com sucesso!');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Erro na análise final:', error);
      
      // Fallback: salvar pelo menos o histórico
      const fallbackData: Partial<CollectedData> = {
        session_id: sessionId,
        historico_conversa: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          files: msg.files?.map(f => f.name) || [],
          hasAudio: !!msg.audioBlob
        })),
        status: 'completed',
        additional_info: `Erro na análise automática: ${error.message}`,
        created_at: new Date().toISOString()
      };
      
      const fallbackSuccess = await saveToDatabase(fallbackData);
      console.log('📋 Dados de fallback salvos:', fallbackSuccess);
      
      return fallbackSuccess;
    }
  }, [sessionId, saveToDatabase]);

  // Salvar avaliação
  const saveEvaluation = useCallback(async (evaluationText: string): Promise<boolean> => {
    console.log('💾 Salvando avaliação:', { evaluationText, sessionId });
    
    const dataToSave: Partial<CollectedData> = {
      session_id: sessionId,
      evaluation_comment: evaluationText,
      status: 'completed',
      updated_at: new Date().toISOString()
    };

    return await saveToDatabase(dataToSave);
  }, [sessionId, saveToDatabase]);

  return {
    isSaving,
    saveStatus,
    lastSaveTime,
    saveConversation,
    analyzeAndSave,
    saveEvaluation,
    createLocalBackup
  };
};

export type { CollectedData };
