import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileImage, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import MarkdownContent from './MarkdownContent';
import ProgressBar from './ProgressBar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
}

interface ChatInterfaceProps {
  onDataCollected: (data: any) => void;
}

interface CollectedData {
  session_id: string;
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      content: `Olá! Eu sou a assistente virtual da **Planner**, e estou aqui para te ajudar a coletar todas as informações necessárias para criarmos um site institucional incrível para sua empresa! 🚀

Este processo será dividido em 8 blocos temáticos para garantir que capturemos todos os detalhes importantes. Vamos começar?

**🔷 BLOCO 1 – Informações Gerais da Empresa**

Para começar, me conte: **qual é o nome da sua empresa?**`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  const systemPrompt = `Você é uma agente especializada da empresa "Planner", responsável por conduzir uma conversa acolhedora e profissional para coletar informações detalhadas sobre a empresa do cliente, visando o desenvolvimento de um site institucional onepage.

INSTRUÇÕES IMPORTANTES:
- Seja sempre empática, clara e profissional
- Siga rigorosamente a sequência dos 8 blocos de perguntas
- Insista educadamente quando informações essenciais estiverem ausentes ou vagas
- Confirme as informações importantes antes de seguir para o próximo bloco
- Use emojis moderadamente para tornar a conversa mais acolhedora
- Ao final, agradeça e informe que todos os dados foram salvos corretamente

BLOCOS DE PERGUNTAS (siga esta ordem):

🔷 BLOCO 1 – Informações Gerais da Empresa
- Nome da empresa
- Slogan (se houver)
- Missão da empresa
- Visão de futuro
- Valores que norteiam a empresa
- Descrição da empresa em poucas palavras
- Principais diferenciais

🔷 BLOCO 2 – Produtos ou Serviços
- Principais produtos/serviços oferecidos
- Descrição de cada produto/serviço e público-alvo
- Produtos/serviços para destacar no site
- Problemas que os produtos/serviços resolvem

🔷 BLOCO 3 – Público-Alvo
- Cliente ideal da empresa
- Principais dores, desejos ou objetivos do público
- Diferentes tipos de clientes

🔷 BLOCO 4 – Prova Social e Autoridade
- Clientes importantes ou cases de sucesso
- Depoimentos, avaliações ou resultados
- Certificações, prêmios ou parcerias

🔷 BLOCO 5 – Design e Estilo
- Estilo visual preferido
- Sites inspiradores (pedir links)
- Cores e fontes da identidade visual
- Logotipo (solicitar arquivo)
- Outras imagens ou vídeos

🔷 BLOCO 6 – Contato e Localização
- Canais de contato para o site
- Endereço físico e mapa
- Formulário de contato e campos

🔷 BLOCO 7 – Objetivo do Site
- Principal objetivo do site
- Principal chamada para ação (CTA)
- Botão flutuante de WhatsApp ou agendamento

🔷 BLOCO 8 – Outras Informações
- Redes sociais ou blog
- Domínio e hospedagem existentes
- Outras informações essenciais

Ao completar todos os blocos, FINALIZE com:
"✅ Perfeito! Coletei todas as informações necessárias para criarmos um site institucional incrível para sua empresa. Todos os dados foram salvos corretamente em nosso sistema. Nossa equipe da Planner entrará em contato em breve para dar continuidade ao projeto. Muito obrigada pela sua colaboração! 🎉"`;

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
    if (content.includes('BLOCO 1')) return 1;
    if (content.includes('BLOCO 2')) return 2;
    if (content.includes('BLOCO 3')) return 3;
    if (content.includes('BLOCO 4')) return 4;
    if (content.includes('BLOCO 5')) return 5;
    if (content.includes('BLOCO 6')) return 6;
    if (content.includes('BLOCO 7')) return 7;
    if (content.includes('BLOCO 8')) return 8;
    if (content.includes('Todos os dados foram salvos')) return 9;
    return currentBlock;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && files.length === 0) return;

    let uploadedFileUrls: string[] = [];
    
    if (files.length > 0) {
      uploadedFileUrls = await uploadFilesToSupabase(files);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      files: files.length > 0 ? [...files] : undefined
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
        files: msg.files?.map(f => f.name)
      }))
    };
    
    setCollectedData(updatedData);
    await saveDataToSupabase(updatedData);

    setInputValue('');
    setFiles([]);
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
      if (assistantResponse.includes('Todos os dados foram salvos corretamente')) {
        setIsCompleted(true);
        
        const finalData = {
          ...updatedData,
          status: 'completed' as const,
          conversation_log: finalMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            files: msg.files?.map(f => f.name)
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
            files: msg.files?.map(f => f.name)
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

  return (
    <div className="h-full flex flex-col">
      {/* Barra de Progresso */}
      <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-purple-50">
        <ProgressBar currentBlock={currentBlock} totalBlocks={totalBlocks} />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs bg-white/20 rounded px-2 py-1">
                        <FileImage className="w-3 h-3" />
                        {file.name}
                      </div>
                    ))}
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
              <Card className="p-4 bg-gray-50">
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
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center gap-2 text-green-800 max-w-4xl mx-auto">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Briefing finalizado! Dados salvos com sucesso no Supabase (ID: {sessionId})
            </span>
          </div>
        </div>
      )}

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <FileImage className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
              disabled={isCompleted}
            >
              <Upload className="w-4 h-4" />
            </Button>
            
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
              className="flex-1"
              disabled={isLoading || isCompleted}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || isCompleted || (!inputValue.trim() && files.length === 0)}
              className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
