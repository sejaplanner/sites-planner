
import React, { useRef, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import MarkdownContent from './MarkdownContent';
import AudioPlayer from './AudioPlayer';
import ImagePreview from './ImagePreview';
import EvaluationCard from './EvaluationCard';
import MessageInput from './MessageInput';
import SaveStatusIndicator from './SaveStatusIndicator';
import { usePersistence } from '@/hooks/usePersistence';
import { useChatState, type Message } from '@/hooks/useChatState';
import { useDataPersistence } from '@/hooks/useDataPersistence';
import { useSessionId } from '@/hooks/useSessionId';
import { useKeyboardState } from '@/hooks/useKeyboardState';

interface ChatInterfaceProps {
  onDataCollected: (data: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataCollected }) => {
  const { sessionId, isInitialized: sessionReady, clearSessionId, validateSessionId } = useSessionId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const evaluationRef = useRef<HTMLDivElement>(null);
  
  const {
    keyboardState,
    inputRef,
    focusInput,
    blurInput,
    handleInputFocus,
    handleInputBlur
  } = useKeyboardState();

  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    setIsLoading,
    files,
    setFiles,
    isCompleted,
    setIsCompleted,
    isEvaluating,
    setIsEvaluating,
    isInitialized,
    setIsInitialized
  } = useChatState(sessionId);

  const {
    isSaving,
    saveStatus,
    lastSaveTime,
    saveConversation,
    analyzeAndSave,
    saveEvaluation,
  } = useDataPersistence(sessionId);

  const {
    isLoading: persistenceLoading,
    persistedData,
    saveToStorage,
    clearStorage
  } = usePersistence(sessionId);

  const systemPrompt = "Você é Sophia, uma agente especializada da empresa \"Planner\", responsável por conduzir uma conversa acolhedora, natural e humanizada para coletar informações detalhadas sobre a empresa do cliente (o usuário), visando obter um briefing para o desenvolvimento de um website para a empresa do cliente.\n\nSOBRE A PLANNER:\nA Planner é uma empresa de Gestão Inteligente de Negócios, especializada na análise e otimização de processos por meio de organização estratégica e soluções tecnológicas personalizadas. Unimos experiência prática em gestão com inovação digital, atuando de forma integrada nos setores público, privado e educacional.\n\nO QUE FAZEMOS:\n- Somos a melhor empresa em soluções inteligentes para automação de Inteligencia Articial, transformando tecnologia em solução funcional para nossos clientes, (como exemplo: a implementação Funcionários Digitais com IA (SDR, Suporte Técnico, SAC, Secretária de Agendamentos)\n- Consultoria Estratégica: redesenho de processos operacionais e organizacionais com foco em eficiência e resultados\n- Sistemas sob Medida: desenvolvimento de soluções low-code, aplicativos personalizados e websites\n- Gestão Pública: sistemas e serviços específicos para Secretarias de Educação, baseados em experiência real de gestão pública\n- Treinamentos e Palestras: formação de equipes e capacitação de líderes em gestão e tecnologia\n- Soluções Integradas: combinamos gestão, engenharia, jurídico, contábil e TI para entregar projetos completos\n\nREGRA FUNDAMENTAL - INFORMAÇÕES OBRIGATÓRIAS PRIMEIRO:\n- O PROCESSO SÓ DEVE INICIAR se o usuário fornecer NOME COMPLETO e NÚMERO DO WHATSAPP (com DDD)\n- Se o usuário não fornecer essas informações essenciais, insista educadamente até obter ambos\n- NÃO prossiga para outros tópicos até ter essas duas informações cruciais\n\nRECONHECIMENTO DE ARQUIVOS ENVIADOS:\n- SEMPRE reconheça quando o usuário enviar arquivos (imagens, documentos, etc.)\n- Quando receber uma imagem, diga explicitamente: \"Recebi sua imagem! Obrigada por compartilhar [descreva brevemente o que vê ou o tipo de arquivo]\"\n- Para logos: \"Perfeito! Recebi o logo da sua empresa. Vou incluir isso no briefing.\"\n- Para referências de layout: \"Excelente! Recebi a imagem de referência do layout. Esse estilo será considerado no desenvolvimento.\"\n- SEMPRE VERIFIQUE respostas anteriores do usuário antes de fazer uma pergunta, para não perguntar algo que ele acabou falando junto com outra resposta\n- NUNCA diga que está aguardando um arquivo se ele já foi enviado\n\nCAMPOS OBRIGATÓRIOS QUE DEVEM SER COLETADOS (TODOS):\n1. Nome completo e WhatsApp (OBRIGATÓRIO PRIMEIRO)\n2. Nome da empresa e descrição do negócio\n3. Missão da empresa\n4. Visão da empresa  \n5. Valores da empresa\n6. Produtos/serviços oferecidos\n7. Público-alvo e suas necessidades\n8. Cases de sucesso e credibilidade (social_proof)\n9. Preferências de de cores, design e estilo visual para o site, de exemplos para ajudar o usuário\n10. **LOGOTIPO: Pergunte se a empresa já possui logotipo. Se sim, PEÇA PARA ENVIAR O ARQUIVO**\n11. **DOMÍNIO: Pergunte se já possui domínio registrado ou se precisaremos adquirir um para o usuário**\n12. Formas de contato e localização da empresa que deve constar no website\n13. Objetivo principal do site\n14. **LAYOUT: Se o cliente tiver algum layout em mente, SUGIRA para ele enviar uma imagem de referência (pode ser print de site ou qualquer referência visual)**\n15. Informações adicionais relevantes\n\nINSTRUÇÕES IMPORTANTES PARA AJUDAR CLIENTES:\n- **Se cliente disser \"não sei\", \"não tenho\", ou \"estou em dúvida\" ou algo do tipo, SEMPRE ofereça ajuda quando cliente não souber responder algo**\n- Se cliente aceitar ajuda, faça perguntas direcionadas para chegar na resposta\n- Se cliente disser algo como \"vou decidir depois\", aceite a resposta e registre como tal\n- Seja MUITO gentil e paciente\n- SEMPRE VERIFIQUE respostas anteriores do usuário antes de fazer uma pergunta, para não perguntar algo que ele acabou falando junto com outra resposta\n- Nunca fale de concorrentes\n- Use linguagem natural e conversacional\n- Se cliente tiver logo, PEÇA pra ele enviar o arquivo, se ele não tiver, pergunte como ele gostaria que fosse o logo (e tente ajudá-lo)\n- Se cliente tiver uma ideia de layout, PEÇA referência visual\n\nEXEMPLO DE COMO AJUDAR:\nCliente: \"Não sei qual é a missão da empresa\"\nSophia: \"Sem problemas! Posso te ajudar a definir. Me conta: qual é o principal objetivo da sua empresa? O que vocês fazem de mais importante para seus clientes? Com base nisso posso sugerir uma missão que faça sentido. Quer que eu te ajude ou prefere pensar nisso depois?\"\n\nENCERRAMENTO DA CONVERSA:\n- SÓ encerre a conversa quando TODOS os 15 campos acima tiverem sido abordados\n- Antes de pedir avaliação, faça um RESUMO COMPLETO de tudo que foi coletado e apresente de maneira itenizada\n- Confirme com o cliente se está tudo correto\n- Só depois de confirmação positiva, encerre com: \"Perfeito! Consegui todas as informações necessárias para desenvolver o briefing do seu site. Agora gostaria de saber como foi nossa conversa para você. Pode avaliar nosso atendimento? ⭐\";";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEvaluation = () => {
    setTimeout(() => {
      evaluationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isEvaluating) {
      scrollToEvaluation();
    }
  }, [isEvaluating]);

  useEffect(() => {
    if (!isLoading && keyboardState.isInputFocused && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && !isCompleted && !isEvaluating) {
          focusInput();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages.length, keyboardState.isInputFocused, isCompleted, isEvaluating]);

  const handleChatAreaClick = (e: React.MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      blurInput();
    }
  };

  useEffect(() => {
    console.log('🔧 ChatInterface - Estado de inicialização:', {
      sessionReady,
      persistenceLoading,
      isInitialized,
      sessionId,
      sessionValid: validateSessionId(sessionId),
      timestamp: new Date().toISOString()
    });

    if (!persistenceLoading && sessionReady && !isInitialized && validateSessionId(sessionId)) {
      if (persistedData && persistedData.messages && persistedData.messages.length > 1) {
        console.log('🔄 Recuperando sessão persistida:', {
          sessionId: persistedData.sessionId,
          messagesCount: persistedData.messages.length,
          timestamp: new Date().toISOString()
        });
        
        setMessages(persistedData.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        console.log('🆕 Iniciando nova conversa:', {
          sessionId,
          timestamp: new Date().toISOString()
        });

        const initialMessage: Message = {
          id: '1',
          content: "Olá! Sou a **Sophia**, assistente virtual da **Planner** e estou aqui para te ajudar a criar um site incrível! 🚀\n\nPara iniciar, preciso saber:\n\n**Qual é o seu nome completo?** 😊",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([initialMessage]);
      }
      setIsInitialized(true);
    }
  }, [persistenceLoading, persistedData, isInitialized, sessionReady, sessionId]);

  useEffect(() => {
    if (isInitialized && messages.length > 0 && sessionReady && validateSessionId(sessionId)) {
      console.log('💾 Salvando automaticamente...');
      saveConversation(messages);
      
      saveToStorage({
        sessionId,
        messages,
        collectedData: {}
      });
    }
  }, [messages, isInitialized, sessionReady, sessionId]);

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileName = sessionId + '/' + Date.now() + '_' + file.name;
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
      console.log('🎤 Iniciando transcrição de áudio, tamanho:', audioBlob.size, 'bytes');
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('📦 Áudio convertido para base64, tamanho:', base64Audio.length, 'caracteres');
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message);
      }
      
      if (!data.success) {
        console.error('❌ Erro na transcrição:', data.error);
        throw new Error(data.error || 'Erro na transcrição');
      }
      
      console.log('✅ Transcrição bem-sucedida:', data.text);
      return data.text || '';
    } catch (error) {
      console.error('❌ Erro completo na transcrição:', error);
      throw error;
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const transcribedText = await transcribeAudio(audioBlob);
      
      if (transcribedText.trim()) {
        console.log('📝 Texto transcrito:', transcribedText);
        await handleSendMessage(transcribedText, [], audioBlob);
      } else {
        throw new Error('Texto transcrito está vazio');
      }
    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationSubmit = async (evaluationText: string) => {
    try {
      console.log('💾 Salvando avaliação:', evaluationText);
      const success = await saveEvaluation(evaluationText);
      
      if (success) {
        const finalMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "Muito obrigada pela sua avaliação! Suas palavras são muito valiosas para nós.\n\n🎉 **Briefing Finalizado com Sucesso!**\n\nNossa equipe da Planner entrará em contato em breve através do WhatsApp informado para dar continuidade ao desenvolvimento do seu site institucional.\n\nTenha um excelente dia! 🚀✨",
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setIsEvaluating(false);
        setIsCompleted(true);
        clearStorage();
        clearSessionId();
        onDataCollected({});
      }
    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
    }
  };

  const handleSendMessage = async (messageText?: string, messageFiles?: File[], audioBlob?: Blob) => {
    const textToSend = messageText || inputValue;
    const filesToSend = messageFiles || files;
    if (!textToSend.trim() && filesToSend.length === 0 && !audioBlob) return;

    if (!validateSessionId(sessionId)) {
      console.error('❌ Session ID inválido ao enviar mensagem:', sessionId);
      return;
    }

    console.log('📤 Enviando mensagem:', {
      sessionId,
      messageLength: textToSend.length,
      filesCount: filesToSend.length,
      hasAudio: !!audioBlob,
      timestamp: new Date().toISOString()
    });

    let uploadedFileUrls: string[] = [];
    if (filesToSend.length > 0) {
      uploadedFileUrls = await uploadFilesToSupabase(filesToSend);
      console.log('📎 Arquivos enviados:', uploadedFileUrls);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      role: 'user',
      timestamp: new Date(),
      files: filesToSend.length > 0 ? [...filesToSend] : undefined,
      audioBlob: audioBlob
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setFiles([]);
    setIsLoading(true);

    // Salvar conversa automaticamente
    await saveConversation(updatedMessages, uploadedFileUrls);

    try {
      const conversationHistory = updatedMessages.map(msg => {
        let content = msg.content;
        
        if (msg.files && msg.files.length > 0) {
          const fileDescriptions = msg.files.map(file => 
            "[ARQUIVO ENVIADO: " + file.name + ", tipo: " + file.type + "]"
          ).join(', ');
          content = content + "\n" + fileDescriptions;
        }
        
        if (msg.audioBlob) {
          content = content + "\n[ÁUDIO ENVIADO]";
        }
        
        return {
          role: msg.role,
          content: content
        };
      });

      console.log('🤖 Enviando para IA:', {
        sessionId,
        messagesCount: conversationHistory.length,
        timestamp: new Date().toISOString()
      });

      const { data: responseData, error } = await supabase.functions.invoke('chat-openai', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          sessionId: sessionId
        }
      });

      if (error) throw new Error("Erro na Edge Function: " + error.message);
      if (!responseData.success) throw new Error(responseData.error || 'Erro desconhecido');

      const assistantResponse = responseData.message;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Salvar conversa final
      await saveConversation(finalMessages, uploadedFileUrls);

      // Verificar se deve iniciar análise - string corrigida
      if (assistantResponse.includes('Consegui todas as informações necessárias para desenvolver o briefing do seu site')) {
        console.log('🔍 Iniciando análise final da conversa...');
        try {
          const analysisSuccess = await analyzeAndSave(finalMessages);
          if (analysisSuccess) {
            console.log('✅ Análise final concluída, iniciando avaliação...');
            setIsEvaluating(true);
          }
        } catch (error) {
          console.error('❌ Erro na análise final:', error);
          setIsEvaluating(true); // Continuar para avaliação mesmo com erro
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (persistenceLoading || !sessionReady || !validateSessionId(sessionId)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full max-w-full overflow-hidden relative">
      <ScrollArea 
        className="flex-1 p-3 md:p-4 min-h-0 w-full max-w-full pb-20"
        ref={chatContainerRef}
        onClick={handleChatAreaClick}
      >
        <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message) => (
            <div key={message.id} className={"flex " + (message.role === 'user' ? 'justify-end' : 'justify-start') + " w-full"}>
              <Card className={"max-w-[85%] md:max-w-[80%] p-3 md:p-4 break-words overflow-hidden " + (
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white border-gray-200 shadow-sm'
              )}>
                <div className="text-sm md:text-base leading-relaxed break-words">
                  {message.role === 'assistant' ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                </div>

                {message.files && message.files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.files.map((file, index) => (
                      <ImagePreview key={index} file={file} />
                    ))}
                  </div>
                )}

                {message.audioBlob && (
                  <div className="mt-3">
                    <AudioPlayer audioBlob={message.audioBlob} isUserMessage={message.role === 'user'} />
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}

          {isEvaluating && (
            <div ref={evaluationRef} className="w-full">
              <EvaluationCard onSubmit={handleEvaluationSubmit} />
            </div>
          )}

          {(isLoading || isSaving) && (
            <div className="flex justify-start">
              <Card className="p-3 md:p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isSaving ? 'Salvando dados...' : 'Sophia está analisando suas informações...'}
                  </span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Status de salvamento */}
      {(saveStatus !== 'idle' || lastSaveTime) && (
        <div className="absolute top-2 right-2 z-10">
          <SaveStatusIndicator 
            status={saveStatus}
            lastSaveTime={lastSaveTime}
          />
        </div>
      )}

      {isCompleted && (
        <div className="p-3 md:p-4 bg-green-50 border-t border-green-200 flex-shrink-0 w-full">
          <div className="flex items-center gap-2 text-green-800 max-w-4xl mx-auto w-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">
              {"Briefing finalizado! Dados salvos com sucesso (ID: " + sessionId + ")"}
            </span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t">
        <MessageInput
          inputValue={inputValue}
          files={files}
          isLoading={isLoading || isSaving}
          isCompleted={isCompleted}
          isEvaluating={isEvaluating}
          onInputChange={setInputValue}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onSendMessage={handleSendMessage}
          onAudioRecorded={handleAudioRecorded}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
