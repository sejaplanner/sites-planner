import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import MobileCarousel from '@/components/MobileCarousel';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Building2, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

const Index = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [collectedData, setCollectedData] = useState(null);

  const handleDataCollected = (data: any) => {
    setCollectedData(data);
    console.log('Dados coletados:', data);
  };

  if (!chatStarted) {
    return (
      <div className="min-h-screen min-h-[100vh] min-h-[-webkit-fill-available] bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent)] pointer-events-none"></div>
        
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 lg:py-16 relative z-10 max-w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 lg:mb-20">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-12">
              <img 
                src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" 
                alt="Planner Logo" 
                className="h-12 md:h-16 lg:h-24 w-auto drop-shadow-lg" 
              />
            </div>
            
            {/* Main Headlines with Premium Typography */}
            <div className="relative max-w-6xl mx-auto px-2">
              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-[1.1] tracking-tight">
                  Vamos criar o{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-medium">website</span>
                    <div className="absolute -bottom-0.5 md:-bottom-1 lg:-bottom-2 left-0 w-full h-0.5 md:h-0.5 lg:h-1 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full opacity-60"></div>
                  </span>
                </h1>
                
                <h2 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-extralight text-gray-800 leading-[1.1] tracking-tight">
                  perfeito para sua{' '}
                  <span className="font-medium text-gray-900">empresa</span>
                </h2>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-2 md:-top-4 lg:-top-8 -right-2 md:-right-4 lg:-right-8 w-12 md:w-16 lg:w-20 h-12 md:h-16 lg:h-20 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-3 md:-bottom-6 lg:-bottom-12 -left-3 md:-left-6 lg:-left-12 w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
            </div>
            
            {/* Subtitle with Modern Typography */}
            <div className="mt-8 md:mt-12 lg:mt-16 max-w-5xl mx-auto text-center px-2 md:px-4">
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed font-light mb-2">
                Nossa{' '}
                <span className="relative">
                  <span className="font-medium text-gray-800">assistente virtual Sophia</span>
                  <div className="absolute -bottom-0.5 md:-bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-50"></div>
                </span>{' '}
                irá conversar com você para entender todos os detalhes da sua empresa 
                e coletar as informações necessárias para desenvolvermos um{' '}
                <span className="relative">
                  <span className="font-medium text-gray-800">website excepcional</span>
                  <div className="absolute -bottom-0.5 md:-bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-50"></div>
                </span>.
              </p>
              
              {/* Subtle decorative line */}
              <div className="mt-6 md:mt-8 lg:mt-12 flex justify-center">
                <div className="w-20 md:w-24 lg:w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Main CTA Card */}
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 px-2 md:px-4">
            <Card className="p-6 md:p-8 lg:p-10 xl:p-14 bg-white/90 backdrop-blur-md border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-purple-50/30 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-full opacity-60"></div>
              
              <div className="relative z-10">
                <div className="mb-4 md:mb-6 lg:mb-8">
                  <div className="inline-flex items-center justify-center w-12 md:w-16 lg:w-18 h-12 md:h-16 lg:h-18 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 md:mb-6 lg:mb-8 shadow-lg">
                    <MessageSquare className="w-6 md:w-8 lg:w-10 h-6 md:h-8 lg:h-10 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-900 mb-3 md:mb-4 lg:mb-6 tracking-tight">
                  Pronto para <span className="font-medium">começar</span>?
                </h3>
                
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mb-6 md:mb-8 lg:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                  O processo leva cerca de <span className="font-medium text-gray-800">10-15 minutos</span> e você pode enviar arquivos como 
                  logo, fotos e outros materiais durante a conversa.
                </p>
                
                <Button 
                  onClick={() => setChatStarted(true)} 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-6 md:px-8 lg:px-12 xl:px-16 py-3 md:py-4 lg:py-5 text-base md:text-lg lg:text-xl font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto hover:scale-105 group touch-manipulation"
                >
                  <MessageSquare className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6 mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
                  Conversar com Sophia
                  <ArrowRight className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Feature Cards - Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-8 md:mb-12 lg:mb-16 max-w-7xl mx-auto px-2 md:px-4">
            <Card className="p-4 md:p-6 lg:p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-10 md:w-12 lg:w-14 h-10 md:h-12 lg:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-3 md:mb-4 lg:mb-6 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-purple-600" />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-2 md:mb-3 lg:mb-4 tracking-tight">Conversa Inteligente</h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed font-light">
                Nossa IA conduzirá uma conversa natural e estruturada para coletar todas as informações 
                da sua empresa de forma organizada.
              </p>
            </Card>

            <Card className="p-4 md:p-6 lg:p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-10 md:w-12 lg:w-14 h-10 md:h-12 lg:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-3 md:mb-4 lg:mb-6 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-blue-600" />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-2 md:mb-3 lg:mb-4 tracking-tight">Processo Otimizado</h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed font-light">
                Dividimos o briefing em blocos temáticos para garantir que nenhum detalhe importante 
                seja esquecido no desenvolvimento do seu site.
              </p>
            </Card>

            <Card className="p-4 md:p-6 lg:p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-10 md:w-12 lg:w-14 h-10 md:h-12 lg:h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-3 md:mb-4 lg:mb-6 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-green-600" />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-2 md:mb-3 lg:mb-4 tracking-tight">Dados Seguros</h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed font-light">
                Todas as informações coletadas são armazenadas com segurança e utilizadas 
                exclusivamente para o desenvolvimento do seu projeto.
              </p>
            </Card>
          </div>

          {/* Mobile Carousel */}
          <div className="mb-6 md:mb-8 lg:mb-12 px-2 md:px-4 md:hidden">
            <MobileCarousel />
          </div>

          {/* Footer */}
          <div className="text-center mt-12 md:mt-16 lg:mt-20 text-gray-500 px-2 md:px-4">
            <p className="text-xs md:text-sm lg:text-base mb-3 md:mb-4 font-light">© 2024 Planner - Criamos experiências digitais excepcionais</p>
            <PrivacyPolicyModal>
              <button className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors font-light">
                Política de Privacidade
              </button>
            </PrivacyPolicyModal>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100vh] h-[-webkit-fill-available] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col overflow-hidden w-full max-w-full ios-safe-area no-scroll-bounce">
      {/* Header do chat - NAVBAR FIXA */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-2 md:p-3 lg:p-4 fixed top-0 left-0 right-0 z-50 shadow-sm w-full">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <img 
              src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" 
              alt="Planner Logo" 
              className="h-6 md:h-8 lg:h-10 w-auto flex-shrink-0" 
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setChatStarted(false)} 
            className="text-gray-600 hover:text-gray-800 flex-shrink-0 border-gray-200 hover:bg-gray-50 touch-manipulation" 
            size="sm"
          >
            <X className="w-3.5 h-3.5 md:hidden" />
            <span className="hidden md:inline text-xs md:text-sm px-2 md:px-4 py-1 md:py-2">
              Voltar ao Início
            </span>
          </Button>
        </div>
      </div>

      {/* Interface do chat - Espaço para navbar fixa */}
      <div className="flex-1 pt-12 md:pt-16 lg:pt-20 min-h-0 overflow-hidden w-full max-w-full">
        <ChatInterface onDataCollected={handleDataCollected} />
      </div>
    </div>
  );
};

export default Index;
