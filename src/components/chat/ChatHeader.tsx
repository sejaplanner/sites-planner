
import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ChatHeaderProps {
  isLoading: boolean;
  isSaving: boolean;
  isCompleted: boolean;
  sessionId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isLoading, 
  isSaving, 
  isCompleted, 
  sessionId 
}) => {
  return (
    <>
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
    </>
  );
};

export default ChatHeader;
