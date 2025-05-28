import React, { useRef, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import MarkdownContent from './MarkdownContent';
import ProgressBar from './ProgressBar';
import AudioPlayer from './AudioPlayer';
import ImagePreview from './ImagePreview';
import EvaluationCard from './EvaluationCard';
import MessageInput from './MessageInput';
import { usePersistence } from '@/hooks/usePersistence';
import { useChatState, type Message } from '@/hooks/useChatState';
import { useDataCollection } from '@/hooks/useDataCollection';
import { useSessionId } from '@/hooks/useSessionId';

interface ChatInterfaceProps {
  onDataCollected: (data: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataCollected }) => {
  const { sessionId, isInitialized: sessionReady, clearSessionId } = useSessionId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    evaluation,
    setEvaluation,
    evaluationComment,
    setEvaluationComment,
    currentProgress,
    setCurrentProgress,
    isInitialized,
    setIsInitialized
  } = useChatState(sessionId);

  const {
    collectedData,
    setCollectedData,
    extractAndSaveData,
    calculateProgress,
    saveDataToSupabase,
    isSaving
  } = useDataCollection(sessionId);

  const {
    isLoading: persistenceLoading,
    persistedData,
    saveToStorage,
    clearStorage
  } = usePersistence(sessionId);

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
10. **LOGOTIPO: Pergunte se a empresa já possui logotipo ou se precisa criar um**
11. **DOMÍNIO: Pergunte se já possui domínio registrado ou se precisa adquirir um**
12. Formas de contato e localização
13. Objetivo principal do site
14. Informações adicionais relevantes

ENCERRAMENTO DA CONVERSA:
- SÓ encerre a conversa quando TODOS os 14 campos acima tiverem sido coletados
- Antes de encerrar, verifique se alguma informação importante está faltando
- Só depois de ter TODAS as informações, pergunte sobre a avaliação

INSTRUÇÕES IMPORTANTES:
- Seja sempre empática, natural e conversacional
- Use linguagem casual mas profissional
- Use emojis moderadamente
- Sempre aguarde a resposta antes de fazer a próxima pergunta
- Confirme informações importantes de forma natural
- Se apresente como Sophia da Planner

FINALIZE APENAS com: "Perfeito! Consegui todas as informações que precisava. Agora gostaria de saber como foi nossa conversa para você. Pode avaliar nosso atendimento? ⭐"`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        
        setMessages(persistedData.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setCollectedData(persistedData.collectedData || collectedData);
        setCurrentProgress(persistedData.currentProgress || 0);
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
        collectedData,
        currentProgress
      });
    }
  }, [messages, collectedData, currentProgress, isInitialized, sessionReady, sessionId]);

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

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const transcribedText = await transcribeAudio(audioBlob);
      if (transcribedText.trim()) {
        await handleSendMessage(transcribedText, [], audioBlob);
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationSubmit = async () => {
    if (evaluation === 0) return;
    try {
      const finalMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Muito obrigada pela sua avaliação${evaluation >= 4 ? ' excelente' : ''}! ${evaluationComment ? 'Suas sugestões são muito valiosas para nós. ' : ''}

🎉 **Briefing Finalizado com Sucesso!**

Nossa equipe da Planner entrará em contato em breve através do WhatsApp informado para dar continuidade ao desenvolvimento do seu site institucional.

Tenha um excelente dia! 🚀✨`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, finalMessage]);
      setIsEvaluating(false);
    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
    }
  };

  const handleSendMessage = async (messageText?: string, messageFiles?: File[], audioBlob?: Blob) => {
    const textToSend = messageText || inputValue;
    const filesToSend = messageFiles || files;
    if (!textToSend.trim() && filesToSend.length === 0 && !audioBlob) return;

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

    try {
      console.log('🔍 Extraindo e salvando dados da mensagem...');
      const extractedData = await extractAndSaveData(textToSend, collectedData, updatedMessages);
      
      const updatedData = {
        ...extractedData,
        uploaded_files: [...(collectedData.uploaded_files || []), ...uploadedFileUrls]
      };
      
      setCollectedData(updatedData);
      const newProgress = calculateProgress(updatedData);
      setCurrentProgress(newProgress);

    } catch (error) {
      console.error('❌ Erro crítico ao extrair/salvar dados:', error);
    }

    setInputValue('');
    setFiles([]);
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

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

      if (error) throw new Error(`Erro na Edge Function: ${error.message}`);
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

      const finalData = {
        ...collectedData,
        historico_conversa: finalMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          files: msg.files?.map(f => f.name) || [],
          hasAudio: !!msg.audioBlob
        }))
      };

      try {
        await saveDataToSupabase(finalData);
        setCollectedData(finalData);
      } catch (saveError) {
        console.error('❌ Erro ao salvar dados finais:', saveError);
      }

      if (assistantResponse.includes('avaliar nosso atendimento')) {
        setIsEvaluating(true);
      } else if (assistantResponse.includes('Nossa equipe da Planner entrará em contato')) {
        setIsCompleted(true);
        clearStorage();
        clearSessionId();
        onDataCollected(finalData);
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

  if (persistenceLoading || !sessionReady) {
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
    <div className="h-full flex flex-col w-full max-w-full overflow-hidden">
      {/* Barra de Progresso - Apenas Desktop */}
      <div className="hidden md:block bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-3 md:p-4 w-full">
        <div className="max-w-4xl mx-auto w-full">
          <ProgressBar currentProgress={currentProgress} isCompact={false} />
        </div>
      </div>

      <ScrollArea className="flex-1 p-3 md:p-4 min-h-0 w-full max-w-full">
        <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
              <Card className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 break-words overflow-hidden ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
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
            <EvaluationCard
              evaluation={evaluation}
              evaluationComment={evaluationComment}
              onEvaluationChange={setEvaluation}
              onCommentChange={setEvaluationComment}
              onSubmit={handleEvaluationSubmit}
            />
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {isCompleted && (
        <div className="p-3 md:p-4 bg-green-50 border-t border-green-200 flex-shrink-0 w-full">
          <div className="flex items-center gap-2 text-green-800 max-w-4xl mx-auto w-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">
              Briefing finalizado! Dados salvos com sucesso (ID: {sessionId})
            </span>
          </div>
        </div>
      )}

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
      />
    </div>
  );
};

export default ChatInterface;
