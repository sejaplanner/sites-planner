
import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'success' | 'error';
  lastSaveTime?: Date | null;
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ 
  status, 
  lastSaveTime, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Salvando...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Salvo',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Erro ao salvar',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      default:
        if (lastSaveTime) {
          const timeAgo = Math.round((Date.now() - lastSaveTime.getTime()) / 1000);
          return {
            icon: <Clock className="w-3 h-3" />,
            text: `Salvo há ${timeAgo}s`,
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600',
            borderColor: 'border-gray-200'
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
