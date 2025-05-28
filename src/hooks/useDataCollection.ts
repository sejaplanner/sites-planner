
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
  status: 'in_progress' | 'completed';
  created_at: string;
}

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

  const saveDataToSupabase = async (data: Partial<CollectedData>, retryCount = 0): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000;

    try {
      console.log(`🔄 TENTATIVA ${retryCount + 1}/${maxRetries} - Salvando dados no Supabase:`, {
        session_id: data.session_id,
        user_name: data.user_name,
        user_whatsapp: data.user_whatsapp,
        company_name: data.company_name,
        historico_length: data.historico_conversa?.length || 0,
        timestamp: new Date().toISOString()
      });

      if (isSaving) {
        console.log('⚠️ Operação de salvamento já em andamento, pulando...');
        return;
      }

      setIsSaving(true);

      const { error } = await supabase
        .from('client_briefings')
        .upsert({
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
          status: data.status,
          created_at: data.created_at,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ ERRO NA TENTATIVA ${retryCount + 1}:`, error);
        
        if (error.message?.includes('duplicate key') && retryCount < maxRetries) {
          console.log(`🔄 Erro de duplicação detectado, tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return saveDataToSupabase(data, retryCount + 1);
        }
        
        throw error;
      } else {
        console.log('✅ DADOS SALVOS COM SUCESSO NO BANCO!', {
          session_id: data.session_id,
          attempt: retryCount + 1,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ ERRO CRÍTICO DE CONEXÃO COM BANCO:', {
        error,
        session_id: data.session_id,
        attempt: retryCount + 1,
        timestamp: new Date().toISOString()
      });
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Tentando novamente em ${retryDelay}ms... (tentativa ${retryCount + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return saveDataToSupabase(data, retryCount + 1);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
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

      const { data: responseData, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          historico_conversa: historico,
          session_id: sessionId
        }
      });

      if (error) throw new Error(`Erro na análise: ${error.message}`);
      if (!responseData.success) throw new Error(responseData.error || 'Erro na análise');

      const finalData = {
        ...collectedData,
        ...responseData.data,
        historico_conversa: historico,
        conversation_log: historico,
        status: 'completed' as const
      };

      console.log('✅ Análise final concluída:', finalData);
      
      await saveDataToSupabase(finalData);
      setCollectedData(finalData);
      
      return finalData;
    } catch (error) {
      console.error('❌ Erro na análise final:', error);
      throw error;
    }
  };

  return {
    collectedData,
    setCollectedData,
    saveConversationHistory,
    analyzeFinalConversation,
    saveDataToSupabase,
    isSaving
  };
};

export type { CollectedData };
