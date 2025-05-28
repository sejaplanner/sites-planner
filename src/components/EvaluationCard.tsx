
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface EvaluationCardProps {
  evaluation: number;
  evaluationComment: string;
  onEvaluationChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  evaluationComment,
  onEvaluationChange,
  onCommentChange,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-start w-full mb-4 md:mb-6">
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 max-w-[85%] md:max-w-[80%] w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-base">
          Agradeço se puder avaliar como foi a sua experiência com nossa conversa? 
          Se quiser envie também um comentário adicional! 😉
        </h3>
        
        <div className="flex gap-2 mb-4 justify-center md:justify-start">
          {[1, 2, 3, 4, 5].map(star => (
            <Button 
              key={star} 
              variant="ghost" 
              size="sm" 
              onClick={() => onEvaluationChange(star)} 
              className={`p-1 touch-manipulation ${evaluation >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              disabled={isSubmitting}
            >
              <Star className="w-6 h-6 md:w-7 md:h-7 fill-current" />
            </Button>
          ))}
        </div>

        {evaluation > 0 && (
          <div className="mb-4">
            <Input
              placeholder="Comentário adicional (opcional)"
              value={evaluationComment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="text-base"
              disabled={isSubmitting}
              style={{ fontSize: '16px' }} // Previne zoom no iOS
            />
          </div>
        )}
        
        <Button 
          onClick={handleSubmit} 
          disabled={evaluation === 0 || isSubmitting} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full md:w-auto touch-manipulation" 
          size="sm"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </Card>
    </div>
  );
};

export default EvaluationCard;
