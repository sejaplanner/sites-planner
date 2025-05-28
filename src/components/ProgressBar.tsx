
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentProgress: number;
  isCompact?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentProgress,
  isCompact = false
}) => {
  if (isCompact) {
    return (
      <div className="w-full">
        <Progress value={currentProgress} className="h-2 w-full" />
        <div className="text-xs text-gray-500 text-center mt-1">
          {currentProgress}%
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progresso do Briefing
        </span>
        <span className="text-sm text-gray-500">
          {currentProgress}% completo
        </span>
      </div>
      <Progress value={currentProgress} className="h-3 w-full" />
      <div className="text-xs text-gray-500 mt-1">
        Coletando informações essenciais para seu site
      </div>
    </div>
  );
};

export default ProgressBar;
