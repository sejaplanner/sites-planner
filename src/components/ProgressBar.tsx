
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentProgress: number;
  isCompact?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentProgress, isCompact = false }) => {
  return (
    <div className={`w-full ${isCompact ? '' : 'max-w-4xl mx-auto'}`}>
      <div className={`flex justify-between items-center ${isCompact ? 'mb-1' : 'mb-3'}`}>
        <h3 className={`font-medium text-gray-700 ${isCompact ? 'text-xs' : 'text-sm md:text-base'}`}>
          Progresso do Briefing
        </h3>
        <span className={`text-gray-600 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {currentProgress}%
        </span>
      </div>
      
      <Progress 
        value={currentProgress} 
        className={`w-full ${isCompact ? 'h-1.5' : 'h-2 md:h-3'}`} 
      />
      
      {!isCompact && (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Início</span>
          <span>Informações Coletadas</span>
          <span>Finalização</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
