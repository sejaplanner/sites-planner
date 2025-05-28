
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  return (
    <div className="flex justify-start w-full mb-20 md:mb-4">
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 max-w-[85%] md:max-w-[80%]">
        <h3 className="font-semibold text-gray-800 mb-3 text-base">
          Agradeço se puder avaliar como foi a sua experiência com nossa conversa? 
          Se quiser envie também um comentário adicional! 😉
        </h3>
        
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <Button 
              key={star} 
              variant="ghost" 
              size="sm" 
              onClick={() => onEvaluationChange(star)} 
              className={`p-1 ${evaluation >= star ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              <Star className="w-6 h-6 fill-current" />
            </Button>
          ))}
        </div>

        <Textarea
          placeholder="Deixe aqui seu comentário (opcional)..."
          value={evaluationComment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="mb-4 resize-none"
          rows={3}
        />
        
        <Button 
          onClick={onSubmit} 
          disabled={evaluation === 0} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
          size="sm"
        >
          Enviar Avaliação
        </Button>
      </Card>
    </div>
  );
};

export default EvaluationCard;
