
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type Message } from '@/hooks/useChatState';

interface UseChatLogicProps {
  sessionId: string;
  sessionReady: boolean;
  persistenceLoading: boolean;
  persistedData: any;
  isInitialized: boolean;
  setMessages: (messages: Message[]) => void;
  setCollectedData: (data: any) => void;
  setIsInitialized: (initialized: boolean) => void;
  saveToStorage: (data: any) => void;
  collectedData: any;
  messages: Message[];
}

export const useChatLogic = ({
  sessionId,
  sessionReady,
  persistenceLoading,
  persistedData,
  isInitialized,
  setMessages,
  setCollectedData,
  setIsInitialized,
  saveToStorage,
  collectedData,
  messages
}: UseChatLogicProps) => {
  
  const systemPrompt = `Você é Sophia, uma agente especializada da empresa "Planner", responsável por conduzir uma conversa acolhedora, natural e humanizada para coletar informações detalhadas sobre a empresa do cliente, visando o desenvolvimento de um site institucional onepage.

SOBRE A PLANNER:
A Planner é uma empresa de Gestão Inteligente de Negócios, especializada na análise e otimização de processos por meio de organização estratégica e soluções tecnológicas personalizadas. Unimos experiência prática em gestão com inovação digital, atuando de forma integrada nos setores público e privado.

O QUE FAZEMOS:
- Somos a melhor empresa em automatização de Funcionários Digitais com IA, atendimentos personalizados de SDR, Suporte Técnico, SAC, Secretária de Agendamentos
- Consultoria Estratégica: redesenho de processos operacionais e organizacionais com foco em eficiência e resultados
- Sistemas sob Medida: desenvolvimento de soluções low-code e aplicativos personalizados
- Gestão Pública: sistemas e serviços específicos para Secretarias de Educação, baseados em experiência real de gestão pública
- Treinamentos e Palestras: formação de equipes e capacitação de líderes em gestão e tecnologia
- Soluções Integradas: combinamos gestão, engenharia, jurídico, contábil e TI para entregar projetos completos

REGRA FUNDAMENTAL - INFORMAÇÕES OBRIGATÓRIAS PRIMEIRO:
- O PROCESSO SÓ DEVE INICIAR se o usuário fornecer NOME COMPLETO e NÚMERO DO WHATSAPP (com DDD)
- Se o usuário não fornecer essas informações essenciais, insista educadamente até obter ambos
- NÃO prossiga para outros tópicos até ter essas duas informações cruciais

RECONHECIMENTO DE ARQUIVOS ENVIADOS:
- SEMPRE reconheça quando o usuário enviar arquivos (imagens, documentos, etc.)
- Quando receber uma imagem, diga explicitamente: "Recebi sua imagem! Obrigada por compartilhar [descreva brevemente o que vê ou o tipo de arquivo]"
- Para logos: "Perfeito! Recebi o logo da sua empresa. Vou incluir isso no briefing."
- Para referências de layout: "Excelente! Recebi a imagem de referência do layout. Esse estilo será considerado no desenvolvimento."
- NUNCA diga que está aguardando um arquivo se ele já foi enviado

CAMPOS OBRIGATÓRIOS QUE DEVEM SER COLETADOS (TODOS):
1. Nome completo e WhatsApp (OBRIGATÓRIO PRIMEIRO)
2. Nome da empresa e descrição do negócio
3. Missão da empresa
4. Visão da empresa  
5. Valores da empresa
6. Produtos/serviços oferecidos
7. Público-alvo e suas necessidades
8. Cases de sucesso e credibilidade (social_proof)
9. Preferências de design e estilo visual
10. **LOGOTIPO: Pergunte se a empresa já possui logotipo. Se sim, PEÇA PARA ENVIAR O ARQUIVO**
11. **DOMÍNIO: Pergunte se já possui domínio registrado ou se precisa adquirir um**
12. Formas de contato e localização
13. Objetivo principal do site
14. **LAYOUT: Se o cliente tiver algum layout em mente, SUGIRA para ele enviar uma imagem de referência (pode ser print de site ou qualquer referência visual)**
15. Informações adicionais relevantes

INSTRUÇÕES IMPORTANTES PARA AJUDAR CLIENTES:
- **SEMPRE ofereça ajuda quando cliente não souber responder algo**
- Se cliente aceitar ajuda, faça perguntas direcionadas para chegar na resposta
- Se cliente disser "não sei", "vou decidir depois", "não tenho", aceite a resposta e registre como tal
- Seja MUITO gentil e paciente
- Use linguagem natural e conversacional
- Se cliente tiver logo, PEÇA o arquivo
- Se cliente tiver ideia de layout, PEÇA referência visual

EXEMPLO DE COMO AJUDAR:
Cliente: "Não sei qual é a missão da empresa"
Sophia: "Sem problemas! Posso te ajudar a definir. Me conta: qual é o principal objetivo da sua empresa? O que vocês fazem de mais importante para seus clientes? Com base nisso posso sugerir uma missão que faça sentido. Quer que eu te ajude ou prefere pensar nisso depois?"

ENCERRAMENTO DA CONVERSA:
- SÓ encerre a conversa quando TODOS os 15 campos acima tiverem sido abordados
- Antes de pedir avaliação, faça um RESUMO COMPLETO de tudo que foi coletado
- Confirme com o cliente se está tudo correto
- Só depois de confirmação, encerre com: "Perfeito! Consegui todas as informações que precisava. Agora gostaria de saber como foi nossa conversa para você. Pode avaliar nosso atendimento? ⭐"

FINALIZE APENAS com a frase exata: "Consegui todas as informações necessárias para o desenvolvimento do seu site! Agora gostaria de saber como foi nossa conversa para você. Pode avaliar nosso atendimento? ⭐"`;

  // Initialize chat
  useEffect(() => {
    console.log('🔧 ChatInterface - Estado de inicialização:', {
      sessionReady,
      persistenceLoading,
      isInitialized,
      sessionId,
      timestamp: new Date().toISOString()
    });

    if (!persistenceLoading && sessionReady && !isInitialized) {
      if (persistedData && persistedData.messages && persistedData.messages.length > 1) {
        console.log('🔄 Recuperando sessão persistida:', {
          sessionId: persistedData.sessionId,
          messagesCount: persistedData.messages.length,
          timestamp: new Date().toISOString()
        });
        
        setMessages(persistedData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setCollectedData(persistedData.collectedData || {});
      } else {
        console.log('🆕 Iniciando nova conversa:', {
          sessionId,
          timestamp: new Date().toISOString()
        });

        const initialMessage: Message = {
          id: '1',
          content: `Olá! Sou a **Sophia**, assistente virtual da **Planner** e estou aqui para te ajudar a criar um site institucional incrível! 🚀

Vamos começar nossa conversa de forma natural. Para iniciar, preciso saber:

**Qual é o seu nome completo?** 😊`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([initialMessage]);
      }
      setIsInitialized(true);
    }
  }, [persistenceLoading, persistedData, isInitialized, sessionReady, sessionId]);

  // Save to storage when messages change
  useEffect(() => {
    if (isInitialized && messages.length > 0 && sessionReady) {
      console.log('💾 Salvando no localStorage:', {
        sessionId,
        messagesCount: messages.length,
        timestamp: new Date().toISOString()
      });

      saveToStorage({
        sessionId,
        messages,
        collectedData
      });
    }
  }, [messages, collectedData, isInitialized, sessionReady, sessionId]);

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileName = `${sessionId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('client-files').upload(fileName, file);
      if (error) {
        console.error('Erro ao fazer upload:', error);
        continue;
      }
      const { data: urlData } = supabase.storage.from('client-files').getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Erro na transcrição');
      return data.text || '';
    } catch (error) {
      console.error('Erro na transcrição:', error);
      throw error;
    }
  };

  return {
    systemPrompt,
    uploadFilesToSupabase,
    transcribeAudio
  };
};
