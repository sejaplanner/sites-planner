
import { useState } from 'react';
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
  user_evaluation?: number;
  evaluation_comment?: string;
  status: 'in_progress' | 'completed';
  created_at: string;
}

// Mutex simples para evitar concorrência
let saveMutex = false;

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useDataCollection = (sessionId: string) => {
  const [collectedData, setCollectedData] = useState<Partial<CollectedData>>({
    session_id: sessionId,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    conversation_log: [],
    historico_conversa: [],
    uploaded_files: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isNewSession, setIsNewSession] = useState(true);

  const backupToLocal = (data: Partial<CollectedData>) => {
    try {
      localStorage.setItem(`backup_${sessionId}`, JSON.stringify({
        ...data,
        backupTimestamp: new Date().toISOString()
      }));
      console.log('💾 Backup local criado para session:', sessionId);
    } catch (error) {
      console.error('❌ Erro ao criar backup local:', error);
    }
  };

  const saveDataToSupabase = async (data: Partial<CollectedData>, retryCount = 0): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000;

    if (!data.session_id || data.session_id.length < 10) {
      console.error('❌ Session ID inválido:', data.session_id);
      throw new Error('Session ID inválido ou ausente');
    }

    if (saveMutex) {
      console.log('⚠️ Operação de salvamento já em andamento, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (saveMutex) {
        console.log('⚠️ Mutex ainda ativo, cancelando operação duplicada');
        return;
      }
    }

    try {
      saveMutex = true;
      console.log(`🔄 TENTATIVA ${retryCount + 1}/${maxRetries} - Salvando dados no Supabase:`, {
        session_id: data.session_id,
        user_name: data.user_name,
        user_whatsapp: data.user_whatsapp,
        company_name: data.company_name,
        historico_length: data.historico_conversa?.length || 0,
        status: data.status,
        isNewSession,
        timestamp: new Date().toISOString()
      });

      setIsSaving(true);

      const { data: existingData, error: selectError } = await supabase
        .from('client_briefings')
        .select('id, session_id')
        .eq('session_id', data.session_id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erro ao verificar dados existentes:', selectError);
        throw selectError;
      }

      if (existingData) {
        console.log('📝 Atualizando registro existente:', existingData.id);
        setIsNewSession(false);
        
        const { error } = await supabase
          .from('client_briefings')
          .update({
            user_name: data.user_name,
            user_whatsapp: data.user_whatsapp,
            company_name: data.company_name,
            slogan: data.slogan,
            mission: data.mission,
            vision: data.vision,
            values: data.values,
            description: data.description,
            differentials: data.differentials,
            products_services: data.products_services,
            target_audience: data.target_audience,
            social_proof: data.social_proof,
            design_preferences: data.design_preferences,
            contact_info: data.contact_info,
            website_objective: data.website_objective,
            additional_info: data.additional_info,
            uploaded_files: data.uploaded_files,
            conversation_log: data.conversation_log,
            historico_conversa: data.historico_conversa,
            user_evaluation: data.user_evaluation,
            evaluation_comment: data.evaluation_comment,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', data.session_id);

        if (error) throw error;
      } else {
        console.log('🆕 Criando novo registro...');
        
        const { error } = await supabase
          .from('client_briefings')
          .insert({
            session_id: data.session_id,
            user_name: data.user_name,
            user_whatsapp: data.user_whatsapp,
            company_name: data.company_name,
            slogan: data.slogan,
            mission: data.mission,
            vision: data.vision,
            values: data.values,
            description: data.description,
            differentials: data.differentials,
            products_services: data.products_services,
            target_audience: data.target_audience,
            social_proof: data.social_proof,
            design_preferences: data.design_preferences,
            contact_info: data.contact_info,
            website_objective: data.website_objective,
            additional_info: data.additional_info,
            uploaded_files: data.uploaded_files,
            conversation_log: data.conversation_log,
            historico_conversa: data.historico_conversa,
            user_evaluation: data.user_evaluation,
            evaluation_comment: data.evaluation_comment,
            status: data.status,
            created_at: data.created_at,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      backupToLocal(data);

      console.log('✅ DADOS SALVOS COM SUCESSO NO BANCO!', {
        session_id: data.session_id,
        attempt: retryCount + 1,
        status: data.status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ ERRO CRÍTICO DE CONEXÃO COM BANCO:', {
        error,
        session_id: data.session_id,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });
      
      backupToLocal(data);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Tentando novamente em ${retryDelay}ms... (tentativa ${retryCount + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return saveDataToSupabase(data, retryCount + 1);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
      saveMutex = false;
    }
  };

  const debouncedSave = debounce(saveDataToSupabase, 500);

  const saveConversationHistory = async (messages: Message[], uploadedFiles: string[] = []): Promise<void> => {
    const historico = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      files: msg.files?.map(f => f.name) || [],
      hasAudio: !!msg.audioBlob
    }));

    const updatedData = {
      ...collectedData,
      historico_conversa: historico,
      conversation_log: historico,
      uploaded_files: [...(collectedData.uploaded_files || []), ...uploadedFiles]
    };

    setCollectedData(updatedData);

    try {
      await saveDataToSupabase(updatedData);
    } catch (error) {
      console.error('❌ FALHA AO SALVAR HISTÓRICO:', error);
    }
  };

  const saveEvaluation = async (evaluationText: string): Promise<void> => {
    console.log('💾 Salvando avaliação do usuário:', { evaluationText, sessionId });
    
    const updatedData = {
      ...collectedData,
      evaluation_comment: evaluationText,
      status: 'completed' as const
    };

    setCollectedData(updatedData);

    try {
      await saveDataToSupabase(updatedData);
      console.log('✅ Avaliação salva com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
      throw error;
    }
  };

  const analyzeFinalConversation = async (messages: Message[]): Promise<Partial<CollectedData>> => {
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

      const cleanedData = {
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
        additional_info: responseData.data.additional_info || null
      };

      const finalData = {
        ...collectedData,
        ...cleanedData,
        historico_conversa: historico,
        conversation_log: historico,
        status: 'completed' as const
      };

      console.log('✅ Dados finais para salvar:', finalData);
      
      await saveDataToSupabase(finalData);
      setCollectedData(finalData);
      
      return finalData;
    } catch (error) {
      console.error('❌ Erro na análise final:', error);
      
      const fallbackData = {
        ...collectedData,
        historico_conversa: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          files: msg.files?.map(f => f.name) || [],
          hasAudio: !!msg.audioBlob
        })),
        status: 'completed' as const,
        additional_info: `Erro na análise automática: ${error.message}`
      };
      
      try {
        await saveDataToSupabase(fallbackData);
        setCollectedData(fallbackData);
      } catch (saveError) {
        console.error('❌ Erro ao salvar dados de fallback:', saveError);
      }
      
      throw error;
    }
  };

  return {
    collectedData,
    setCollectedData,
    saveConversationHistory,
    analyzeFinalConversation,
    saveDataToSupabase,
    saveEvaluation,
    isSaving
  };
};

export type { CollectedData };
