import React, { useRef, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MessageInput from './MessageInput';
import ChatContainer from './chat/ChatContainer';
import ChatHeader from './chat/ChatHeader';
import { useChatLogic } from './chat/useChatLogic';
import { usePersistence } from '@/hooks/usePersistence';
import { useChatState, type Message } from '@/hooks/useChatState';
import { useDataCollection } from '@/hooks/useDataCollection';
import { useSessionId } from '@/hooks/useSessionId';
import { useKeyboardState } from '@/hooks/useKeyboardState';

interface ChatInterfaceProps {
  onDataCollected: (data: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataCollected }) => {
  const { sessionId, isInitialized: sessionReady, clearSessionId } = useSessionId();
  
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
    evaluation,
    setEvaluation,
    evaluationComment,
    setEvaluationComment,
    isInitialized,
    setIsInitialized
  } = useChatState(sessionId);

  const {
    collectedData,
    setCollectedData,
    saveConversationHistory,
    saveEvaluation,
    analyzeFinalConversation,
    isSaving
  } = useDataCollection(sessionId);

  const {
    isLoading: persistenceLoading,
    persistedData,
    saveToStorage,
    clearStorage
  } = usePersistence(sessionId);

  const { systemPrompt, uploadFilesToSupabase, transcribeAudio } = useChatLogic({
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
  });

  // Implementar auto-focus após envio de mensagem
  useEffect(() => {
    if (!isLoading && keyboardState.isInputFocused && inputRef.current) {
      // Pequeno delay para garantir que a mensagem foi enviada
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
      await saveEvaluation(evaluation, evaluationComment);
      
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

    try {
      await saveConversationHistory(updatedMessages, uploadedFileUrls);
    } catch (error) {
      console.error('❌ Erro ao salvar histórico:', error);
    }

    setInputValue('');
    setFiles([]);
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map(msg => {
        let content = msg.content;
        
        if (msg.files && msg.files.length > 0) {
          const fileDescriptions = msg.files.map(file => 
            `[ARQUIVO ENVIADO: ${file.name}, tipo: ${file.type}]`
          ).join(', ');
          content = `${content}\n${fileDescriptions}`;
        }
        
        if (msg.audioBlob) {
          content = `${content}\n[ÁUDIO ENVIADO]`;
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

      try {
        await saveConversationHistory(finalMessages, uploadedFileUrls);
      } catch (error) {
        console.error('❌ Erro ao salvar histórico final:', error);
      }

      if (assistantResponse.includes('Consegui todas as informações necessárias')) {
        console.log('🔍 Iniciando análise final da conversa...');
        try {
          const finalData = await analyzeFinalConversation(finalMessages);
          setCollectedData(finalData);
          console.log('✅ Análise final concluída, iniciando avaliação...');
          setIsEvaluating(true);
        } catch (error) {
          console.error('❌ Erro na análise final:', error);
          setIsEvaluating(true);
        }
      } else if (assistantResponse.includes('Nossa equipe da Planner entrará em contato')) {
        setIsCompleted(true);
        clearStorage();
        clearSessionId();
        onDataCollected(collectedData);
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const evaluationPadding = isEvaluating ? (isMobile ? '160px' : '40px') : '0px';
  
  const containerStyle = isMobile ? {
    paddingBottom: keyboardState.isOpen 
      ? `${Math.max(keyboardState.height, 280)}px` 
      : evaluationPadding,
    transition: 'padding-bottom 0.3s ease-in-out'
  } : {
    paddingBottom: evaluationPadding
  };

  return (
    <div 
      className="h-full flex flex-col w-full max-w-full overflow-hidden relative"
      style={containerStyle}
    >
      <ChatContainer
        messages={messages}
        isEvaluating={isEvaluating}
        evaluation={evaluation}
        evaluationComment={evaluationComment}
        onEvaluationChange={setEvaluation}
        onCommentChange={setEvaluationComment}
        onEvaluationSubmit={handleEvaluationSubmit}
        onChatAreaClick={handleChatAreaClick}
      >
        <ChatHeader
          isLoading={isLoading}
          isSaving={isSaving}
          isCompleted={isCompleted}
          sessionId={sessionId}
        />
      </ChatContainer>

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

      <div className={`w-full flex-shrink-0 ${
        isMobile 
          ? 'fixed bottom-0 left-0 right-0 z-50'
          : 'sticky bottom-0 z-50'
      }`}>
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
