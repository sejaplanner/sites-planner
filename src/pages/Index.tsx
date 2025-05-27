
import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import MobileCarousel from '@/components/MobileCarousel';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Building2, Sparkles, CheckCircle2, X } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

const Index = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [collectedData, setCollectedData] = useState(null);

  const handleDataCollected = (data: any) => {
    setCollectedData(data);
    console.log('Dados coletados:', data);
  };

  if (!chatStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" 
                alt="Planner Logo" 
                className="h-12 md:h-16 w-auto"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
              Vamos criar o site institucional perfeito para sua empresa
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Nossa assistente virtual irá conversar com você para entender todos os detalhes da sua empresa 
              e coletar as informações necessárias para desenvolvermos um site institucional incrível.
            </p>
          </div>

          {/* Seção de início */}
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                O processo leva cerca de 10-15 minutos e você pode enviar arquivos como 
                logo, fotos e outros materiais durante a conversa.
              </p>
              <Button
                onClick={() => setChatStarted(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Iniciar Conversa
              </Button>
            </Card>
          </div>

          {/* Cards informativos - Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto px-4">
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conversa Inteligente</h3>
              <p className="text-gray-600">
                Nossa IA conduzirá uma conversa natural e estruturada para coletar todas as informações 
                da sua empresa de forma organizada.
              </p>
            </Card>

            <Card className="p-6 bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processo Otimizado</h3>
              <p className="text-gray-600">
                Dividimos o briefing em blocos temáticos para garantir que nenhum detalhe importante 
                seja esquecido no desenvolvimento do seu site.
              </p>
            </Card>

            <Card className="p-6 bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dados Seguros</h3>
              <p className="text-gray-600">
                Todas as informações coletadas são armazenadas com segurança e utilizadas 
                exclusivamente para o desenvolvimento do seu projeto.
              </p>
            </Card>
          </div>

          {/* Cards informativos - Mobile Carousel */}
          <div className="mb-8 md:mb-12 px-4">
            <MobileCarousel />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 md:mt-12 text-gray-500 px-4">
            <p className="text-sm md:text-base mb-2">© 2024 Planner - Criamos experiências digitais excepcionais</p>
            <PrivacyPolicyModal>
              <button className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
                Política de Privacidade
              </button>
            </PrivacyPolicyModal>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header do chat */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 md:p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <img 
              src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" 
              alt="Planner Logo" 
              className="h-8 md:h-10 w-auto flex-shrink-0"
            />
            
            {/* Barra de progresso compacta no mobile */}
            <div className="block md:hidden flex-1 mx-2">
              <ProgressBar currentBlock={1} totalBlocks={8} isCompact={true} />
            </div>
            
            <div className="hidden md:block">
              <p className="text-xs md:text-sm text-gray-600">Assistente de Briefing</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setChatStarted(false)}
            className="text-gray-600 hover:text-gray-800 flex-shrink-0"
            size="sm"
          >
            <X className="w-4 h-4 md:hidden" />
            <span className="hidden md:inline text-xs md:text-sm px-2 md:px-4 py-1 md:py-2">
              Voltar ao Início
            </span>
          </Button>
        </div>
      </div>

      {/* Interface do chat */}
      <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)]">
        <ChatInterface onDataCollected={handleDataCollected} />
      </div>
    </div>
  );
};

export default Index;
