import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import MobileCarousel from '@/components/MobileCarousel';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Building2, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
const Index = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [collectedData, setCollectedData] = useState(null);
  const handleDataCollected = (data: any) => {
    setCollectedData(data);
    console.log('Dados coletados:', data);
  };
  if (!chatStarted) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent)] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 md:mb-20">
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" alt="Planner Logo" className="h-14 md:h-20 w-auto drop-shadow-lg" />
            </div>
            
            {/* Main Headlines with Premium Typography */}
            <div className="relative max-w-5xl mx-auto">
              <div className="space-y-6">
                <h1 className="text-4xl font-light text-gray-900 leading-[1.1] tracking-tight md:text-6xl">
                  Vamos criar o{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-medium">website</span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full opacity-60"></div>
                  </span>
                </h1>
                
                <h2 className="text-4xl font-extralight text-gray-800 leading-[1.1] tracking-tight my-[8px] md:text-6xl">
                  perfeito para sua{' '}
                  <span className="font-medium text-gray-900">empresa</span>
                </h2>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
            </div>
            
            {/* Subtitle with Modern Typography */}
            <div className="mt-12 max-w-4xl py-0 mx my-[34px] mx-[54px]">
              <p className="text-xl text-gray-600 leading-relaxed font-light md:text-xl my-[5px] px-0 text-center mx-[22px]">
                Nossa{' '}
                <span className="relative">
                  <span className="font-medium text-gray-800">assistente virtual inteligente</span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-50"></div>
                </span>{' '}
                irá conversar com você para entender todos os detalhes da sua empresa 
                e coletar as informações necessárias para desenvolvermos um{' '}
                <span className="relative">
                  <span className="font-medium text-gray-800">site institucional excepcional</span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-50"></div>
                </span>.
              </p>
              
              {/* Subtle decorative line */}
              <div className="mt-8 flex justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Main CTA Card */}
          <div className="text-center max-w-3xl mx-auto mb-16 px-4">
            <Card className="p-8 md:p-12 bg-white/90 backdrop-blur-md border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden py-[25px]">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-purple-50/30 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-full opacity-60"></div>
              
              <div className="relative z-10">
                <div className="mb-6 py-0 my-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight md:text-2xl">
                  Pronto para <span className="font-medium">começar</span>?
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed font-light max-w-2xl mx-auto text-base">
                  O processo leva cerca de <span className="font-medium text-gray-800">10-15 minutos</span> e você pode enviar arquivos como 
                  logo, fotos e outros materiais durante a conversa.
                </p>
                
                <Button onClick={() => setChatStarted(true)} size="lg" className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-8 md:px-12 py-4 text-lg font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto hover:scale-105 group">
                  <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Iniciar Conversa
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Feature Cards - Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-16 max-w-7xl mx-auto px-4">
            <Card className="p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Conversa Inteligente</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Nossa IA conduzirá uma conversa natural e estruturada para coletar todas as informações 
                da sua empresa de forma organizada.
              </p>
            </Card>

            <Card className="p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Processo Otimizado</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Dividimos o briefing em blocos temáticos para garantir que nenhum detalhe importante 
                seja esquecido no desenvolvimento do seu site.
              </p>
            </Card>

            <Card className="p-8 bg-white/60 backdrop-blur-sm border-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">Dados Seguros</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                Todas as informações coletadas são armazenadas com segurança e utilizadas 
                exclusivamente para o desenvolvimento do seu projeto.
              </p>
            </Card>
          </div>

          {/* Mobile Carousel */}
          <div className="mb-12 px-4 md:hidden">
            <MobileCarousel />
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500 px-4">
            <p className="text-sm md:text-base mb-3 font-light">© 2024 Planner - Criamos experiências digitais excepcionais</p>
            <PrivacyPolicyModal>
              <button className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors font-light">
                Política de Privacidade
              </button>
            </PrivacyPolicyModal>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header do chat */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-3 md:p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <img src="/lovable-uploads/5c0ccf07-d389-4d69-994b-f9cc7ceffa39.png" alt="Planner Logo" className="h-8 md:h-10 w-auto flex-shrink-0" />
            
            {/* Barra de progresso compacta no mobile */}
            <div className="block md:hidden flex-1 mx-2">
              <ProgressBar currentBlock={1} totalBlocks={8} isCompact={true} />
            </div>
            
            <div className="hidden md:block">
              <p className="text-xs md:text-sm text-gray-600 font-medium">Assistente de Briefing</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => setChatStarted(false)} className="text-gray-600 hover:text-gray-800 flex-shrink-0 border-gray-200 hover:bg-gray-50" size="sm">
            <X className="w-4 h-4 md:hidden" />
            <span className="hidden md:inline text-xs md:text-sm px-2 md:px-4 py-1 md:py-2">
              Voltar ao Início
            </span>
          </Button>
        </div>
      </div>

      {/* Interface do chat - Ajustada para mobile */}
      <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] pb-safe">
        <ChatInterface onDataCollected={handleDataCollected} />
      </div>
    </div>;
};
export default Index;