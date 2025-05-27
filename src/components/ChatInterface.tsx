
import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileImage, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import MarkdownContent from './MarkdownContent';
import ProgressBar from './ProgressBar';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import ImagePreview from './ImagePreview';
import { usePersistence } from '@/hooks/usePersistence';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
  audioBlob?: Blob;
}

interface ChatInterfaceProps {
  onDataCollected: (data: any) => void;
}

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
  status: 'in_progress' | 'completed';
  created_at: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataCollected }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [collectedData, setCollectedData] = useState<Partial<CollectedData>>({
    session_id: sessionId,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    conversation_log: [],
    uploaded_files: []
  });
  const [currentBlock, setCurrentBlock] = useState(1);
  const totalBlocks = 8;
  const [isInitialized, setIsInitialized] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading: persistenceLoading, persistedData, saveToStorage, clearStorage } = usePersistence(sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!persistenceLoading && !isInitialized) {
      if (persistedData && persistedData.messages && persistedData.messages.length > 1) {
        // Recuperar sessão anterior
        setMessages(persistedData.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setCollectedData(persistedData.collectedData || collectedData);
        setCurrentBlock(persistedData.currentBlock || 1);
        console.log('Sessão recuperada:', persistedData);
      } else {
        // Iniciar nova conversa
        const initialMessage: Message = {
          id: '1',
          content: `Olá! Sou a assistente virtual da **Planner** e estou aqui para te ajudar a criar um site institucional incrível! 🚀

Vamos começar nossa conversa de forma natural. Para iniciar, preciso saber:

**Qual é o seu nome?** 😊`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([initialMessage]);
      }
      setIsInitialized(true);
    }
  }, [persistenceLoading, persistedData, isInitialized]);

  // Salvar progresso automaticamente
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveToStorage({
        sessionId,
        messages,
        collectedData,
        currentBlock
      });
    }
  }, [messages, collectedData, currentBlock, isInitialized]);

  const systemPrompt = `Você é uma agente especializada da empresa "Planner", responsável por conduzir uma conversa acolhedora, natural e humanizada para coletar informações detalhadas sobre a empresa do cliente, visando o desenvolvimento de um site institucional onepage.

INSTRUÇÕES IMPORTANTES:
- Seja sempre empática, natural e conversacional como se fosse uma conversa entre amigos
- FAÇA UMA PERGUNTA POR VEZ - nunca envie listas ou múltiplas perguntas
- Use linguagem casual mas profissional, sem ser robótica
- Confirme as informações importantes de forma natural na conversa
- Use emojis moderadamente para tornar a conversa mais acolhedora
- Sempre aguarde a resposta antes de fazer a próxima pergunta
- Quando necessário, peça esclarecimentos ou mais detalhes sobre pontos importantes

FLUXO DA CONVERSA (uma pergunta por vez):

🔷 BLOCO 1 – Informações de Contato
1. Nome completo do usuário
2. WhatsApp (com DDD)

🔷 BLOCO 2 – Informações da Empresa  
3. Nome da empresa
4. Conte-me sobre sua empresa em poucas palavras
5. Qual é a missão da empresa?
6. Como vocês enxergam o futuro? (visão)
7. Quais valores são importantes para vocês?
8. Vocês têm um slogan? 
9. O que vocês fazem de diferente dos concorrentes?

🔷 BLOCO 3 – Produtos/Serviços
10. Quais são os principais produtos ou serviços?
11. Qual produto/serviço vocês mais querem destacar?
12. Que problemas vocês resolvem para seus clientes?

🔷 BLOCO 4 – Público-Alvo
13. Quem é o cliente ideal de vocês?
14. Quais são as principais dores do seu público?
15. Vocês atendem diferentes tipos de clientes?

🔷 BLOCO 5 – Credibilidade
16. Vocês têm clientes importantes ou cases de sucesso?
17. Têm depoimentos ou resultados para compartilhar?
18. Alguma certificação, prêmio ou parceria importante?

🔷 BLOCO 6 – Visual e Design
19. Como vocês imaginam o visual do site?
20. Têm algum site que acham inspirador?
21. Já têm logo e identidade visual definida?
22. Que cores representam bem a empresa?

🔷 BLOCO 7 – Contato
23. Como os clientes podem entrar em contato?
24. Vocês têm endereço físico para mostrar?
25. Que informações são importantes no formulário de contato?

🔷 BLOCO 8 – Objetivo Final
26. Qual o principal objetivo do site?
27. O que vocês querem que o visitante faça no site?
28. Querem botão de WhatsApp flutuante?

FINALIZE com: "Perfeito! Consegui todas as informações que precisava. Nossa equipe da Planner entrará em contato em breve para dar continuidade ao projeto. Muito obrigada! 🎉"

IMPORTANTE: Nunca faça múltiplas perguntas. Sempre uma por vez, de forma natural e conversacional.`;

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileName = `${sessionId}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('client-files')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('client-files')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const saveDataToSupabase = async (data: Partial<CollectedData>) => {
    try {
      const { error } = await supabase
        .from('client_briefings')
        .upsert({
          session_id: data.session_id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
      } else {
        console.log('Dados salvos com sucesso no Supabase');
      }
    } catch (error) {
      console.error('Erro na conexão com Supabase:', error);
    }
  };

  const detectCurrentBlock = (content: string): number => {
    if (content.includes('WhatsApp')) return 1;
    if (content.includes('missão') || content.includes('empresa')) return 2;
    if (content.includes('produto') || content.includes('serviço')) return 3;
    if (content.includes('cliente') || content.includes('público')) return 4;
    if (content.includes('depoimento') || content.includes('case')) return 5;
    if (content.includes('visual') || content.includes('design') || content.includes('logo')) return 6;
    if (content.includes('contato') || content.includes('endereço')) return 7;
    if (content.includes('objetivo') || content.includes('visitante')) return 8;
    if (content.includes('Nossa equipe da Planner entrará em contato')) return 9;
    return currentBlock;
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      // Converter Blob para base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro na transcrição');
      }

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
        setInputValue(transcribedText);
        // Enviar automaticamente após transcrever
        await handleSendMessage(transcribedText, [], audioBlob);
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      // Adicionar mensagem de erro amigável
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText?: string, messageFiles?: File[], audioBlob?: Blob) => {
    const textToSend = messageText || inputValue;
    const filesToSend = messageFiles || files;
    
    if (!textToSend.trim() && filesToSend.length === 0 && !audioBlob) return;

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
    
    // Atualizar dados coletados com arquivos
    const updatedData = {
      ...collectedData,
      uploaded_files: [...(collectedData.uploaded_files || []), ...uploadedFileUrls],
      conversation_log: updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        files: msg.files?.map(f => f.name),
        hasAudio: !!msg.audioBlob
      }))
    };
    
    setCollectedData(updatedData);
    await saveDataToSupabase(updatedData);

    if (!messageText) {
      setInputValue('');
      setFiles([]);
    }
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Chamada para a Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('chat-openai', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          sessionId: sessionId
        }
      });

      if (error) {
        throw new Error(`Erro na Edge Function: ${error.message}`);
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Erro desconhecido');
      }

      const assistantResponse = responseData.message;

      // Detectar bloco atual baseado na resposta
      const detectedBlock = detectCurrentBlock(assistantResponse);
      setCurrentBlock(detectedBlock);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Verificar se a conversa foi finalizada
      if (assistantResponse.includes('Nossa equipe da Planner entrará em contato')) {
        setIsCompleted(true);
        clearStorage(); // Limpar dados locais quando completado
        
        const finalData = {
          ...updatedData,
          status: 'completed' as const,
          conversation_log: finalMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            files: msg.files?.map(f => f.name),
            hasAudio: !!msg.audioBlob
          }))
        };
        
        setCollectedData(finalData);
        await saveDataToSupabase(finalData);
        onDataCollected(finalData);
      } else {
        // Salvar progresso da conversa
        const progressData = {
          ...updatedData,
          conversation_log: finalMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            files: msg.files?.map(f => f.name),
            hasAudio: !!msg.audioBlob
          }))
        };
        
        setCollectedData(progressData);
        await saveDataToSupabase(progressData);
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

  if (persistenceLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Barra de Progresso - Apenas Desktop */}
      <div className="hidden md:block p-3 md:p-4 border-b bg-gradient-to-r from-slate-50 to-purple-50">
        <ProgressBar currentBlock={currentBlock} totalBlocks={totalBlocks} />
      </div>

      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="text-sm md:text-base leading-relaxed">
                  {message.role === 'assistant' ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>

                {/* Preview de imagens */}
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.files.map((file, index) => (
                      <ImagePreview key={index} file={file} />
                    ))}
                  </div>
                )}

                {/* Player de áudio */}
                {message.audioBlob && (
                  <div className="mt-3">
                    <AudioPlayer 
                      audioBlob={message.audioBlob} 
                      isUserMessage={message.role === 'user'} 
                    />
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="p-3 md:p-4 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analisando suas informações...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {isCompleted && (
        <div className="p-3 md:p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center gap-2 text-green-800 max-w-4xl mx-auto">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">
              Briefing finalizado! Dados salvos com sucesso no Supabase (ID: {sessionId})
            </span>
          </div>
        </div>
      )}

      <div className="border-t bg-white p-3 md:p-4">
        <div className="max-w-4xl mx-auto">
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <ImagePreview 
                  key={index} 
                  file={file} 
                  onRemove={() => removeFile(index)}
                  showRemove={true}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-10 w-10 md:h-10 md:w-10"
              disabled={isCompleted}
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            <AudioRecorder onAudioRecorded={handleAudioRecorded} />
            
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isCompleted ? "Briefing finalizado" : "Digite sua resposta..."}
              className="flex-1 text-sm md:text-base"
              disabled={isLoading || isCompleted}
            />
            
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || isCompleted || (!inputValue.trim() && files.length === 0)}
              className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 w-10 md:h-10 md:w-10"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
