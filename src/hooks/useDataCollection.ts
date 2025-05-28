
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractUserName, extractWhatsApp, extractDataFromConversation } from '@/utils/dataExtraction';
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

export const useDataCollection = (sessionId: string) => {
  const [collectedData, setCollectedData] = useState<Partial<CollectedData>>({
    session_id: sessionId,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    conversation_log: [],
    historico_conversa: [],
    uploaded_files: []
  });

  const saveDataToSupabase = async (data: Partial<CollectedData>) => {
    try {
      console.log('🔄 SALVANDO DADOS IMEDIATAMENTE NO SUPABASE:', {
        session_id: data.session_id,
        user_name: data.user_name,
        user_whatsapp: data.user_whatsapp,
        company_name: data.company_name,
        historico_length: data.historico_conversa?.length || 0
      });

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
        });

      if (error) {
        console.error('❌ ERRO CRÍTICO AO SALVAR:', error);
        throw error;
      } else {
        console.log('✅ DADOS SALVOS COM SUCESSO NO BANCO!');
      }
    } catch (error) {
      console.error('❌ ERRO DE CONEXÃO COM BANCO:', error);
      throw error;
    }
  };

  const extractAndSaveData = async (content: string, existingData: Partial<CollectedData>, messages: Message[]): Promise<Partial<CollectedData>> => {
    const updatedData = { ...existingData };
    
    console.log('🔍 Extraindo dados da mensagem:', content);

    // Extrair nome do usuário
    if (!updatedData.user_name) {
      const name = extractUserName(content);
      if (name) {
        updatedData.user_name = name;
        console.log('✅ Nome extraído:', name);
      }
    }

    // Extrair WhatsApp
    if (!updatedData.user_whatsapp) {
      const whatsapp = extractWhatsApp(content);
      if (whatsapp) {
        updatedData.user_whatsapp = whatsapp;
        console.log('✅ WhatsApp extraído:', whatsapp);
      }
    }

    // Extrair dados usando a função do utils
    const extractedBriefingData = extractDataFromConversation([{
      role: 'user',
      content
    }]);

    // Mapear os dados extraídos
    if (extractedBriefingData.companyInfo.name && !updatedData.company_name) {
      updatedData.company_name = extractedBriefingData.companyInfo.name;
      console.log('✅ Nome da empresa extraído:', extractedBriefingData.companyInfo.name);
    }
    if (extractedBriefingData.companyInfo.description && !updatedData.description) {
      updatedData.description = extractedBriefingData.companyInfo.description;
      console.log('✅ Descrição extraída');
    }
    if (extractedBriefingData.companyInfo.mission && !updatedData.mission) {
      updatedData.mission = extractedBriefingData.companyInfo.mission;
      console.log('✅ Missão extraída');
    }
    if (extractedBriefingData.companyInfo.vision && !updatedData.vision) {
      updatedData.vision = extractedBriefingData.companyInfo.vision;
      console.log('✅ Visão extraída');
    }
    if (extractedBriefingData.companyInfo.values && !updatedData.values) {
      updatedData.values = extractedBriefingData.companyInfo.values;
      console.log('✅ Valores extraídos');
    }
    if (extractedBriefingData.companyInfo.slogan && !updatedData.slogan) {
      updatedData.slogan = extractedBriefingData.companyInfo.slogan;
      console.log('✅ Slogan extraído');
    }
    if (extractedBriefingData.productsServices.main && !updatedData.products_services) {
      updatedData.products_services = extractedBriefingData.productsServices.main;
      console.log('✅ Produtos/serviços extraídos');
    }
    if (extractedBriefingData.targetAudience.ideal && !updatedData.target_audience) {
      updatedData.target_audience = extractedBriefingData.targetAudience.ideal;
      console.log('✅ Público-alvo extraído');
    }
    if (extractedBriefingData.socialProof.clients && !updatedData.social_proof) {
      updatedData.social_proof = extractedBriefingData.socialProof.clients;
      console.log('✅ Prova social extraída');
    }
    if (extractedBriefingData.design.style && !updatedData.design_preferences) {
      updatedData.design_preferences = extractedBriefingData.design.style;
      console.log('✅ Preferências de design extraídas');
    }
    if (extractedBriefingData.contact.channels && !updatedData.contact_info) {
      updatedData.contact_info = extractedBriefingData.contact.channels;
      console.log('✅ Informações de contato extraídas');
    }
    if (extractedBriefingData.objectives.main && !updatedData.website_objective) {
      updatedData.website_objective = extractedBriefingData.objectives.main;
      console.log('✅ Objetivo do site extraído');
    }

    // Preparar histórico completo da conversa
    const historico = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      files: msg.files?.map(f => f.name) || [],
      hasAudio: !!msg.audioBlob
    }));

    // Atualizar dados com histórico
    updatedData.historico_conversa = historico;
    updatedData.conversation_log = historico;

    console.log('💾 Dados atualizados para salvar:', {
      session_id: updatedData.session_id,
      user_name: updatedData.user_name,
      user_whatsapp: updatedData.user_whatsapp,
      company_name: updatedData.company_name,
      totalMessages: historico.length
    });

    // SALVAR IMEDIATAMENTE NO BANCO
    await saveDataToSupabase(updatedData);
    
    return updatedData;
  };

  const calculateProgress = (data: Partial<CollectedData>): number => {
    const requiredFields = [
      'user_name', 'user_whatsapp', 'company_name', 'description', 
      'mission', 'vision', 'values', 'products_services', 
      'target_audience', 'social_proof', 'design_preferences', 
      'contact_info', 'website_objective', 'additional_info'
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = data[field as keyof CollectedData];
      return value && String(value).trim() !== '';
    });
    
    const progress = Math.round((filledFields.length / requiredFields.length) * 100);
    console.log(`📊 Progresso: ${filledFields.length}/${requiredFields.length} campos (${progress}%)`);
    console.log('✅ Campos preenchidos:', filledFields);
    console.log('❌ Campos faltando:', requiredFields.filter(f => !filledFields.includes(f)));
    
    return progress;
  };

  return {
    collectedData,
    setCollectedData,
    extractAndSaveData,
    calculateProgress,
    saveDataToSupabase
  };
};

export type { CollectedData };
