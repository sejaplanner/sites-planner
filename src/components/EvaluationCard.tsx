
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface EvaluationCardProps {
  onSubmit: (evaluationText: string) => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ onSubmit }) => {
  const [evaluationText, setEvaluationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!evaluationText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(evaluationText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex justify-start w-full mb-4 md:mb-6">
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 max-w-[85%] md:max-w-[80%] w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-base">
          Como foi a sua experiência conosco? Conte-nos sua opinião! 😊
        </h3>
        
        <div className="mb-4">
          <Textarea
            placeholder="Descreva sua experiência, sugestões ou comentários..."
            value={evaluationText}
            onChange={(e) => setEvaluationText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-base min-h-[80px] resize-none"
            disabled={isSubmitting}
            maxLength={500}
            style={{ fontSize: '16px' }}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {evaluationText.length}/500 caracteres
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!evaluationText.trim() || isSubmitting} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full md:w-auto touch-manipulation flex items-center gap-2" 
          size="sm"
        >
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Avaliação
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default EvaluationCard;
