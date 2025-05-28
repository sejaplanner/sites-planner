
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import EvaluationCard from '../EvaluationCard';
import { type Message } from '@/hooks/useChatState';

interface ChatContainerProps {
  messages: Message[];
  isEvaluating: boolean;
  evaluation: number;
  evaluationComment: string;
  onEvaluationChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onEvaluationSubmit: () => void;
  onChatAreaClick: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isEvaluating,
  evaluation,
  evaluationComment,
  onEvaluationChange,
  onCommentChange,
  onEvaluationSubmit,
  onChatAreaClick,
  children
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea 
      className="flex-1 p-3 md:p-4 min-h-0 w-full max-w-full"
      ref={chatContainerRef}
      onClick={onChatAreaClick}
    >
      <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isEvaluating && (
          <EvaluationCard
            evaluation={evaluation}
            evaluationComment={evaluationComment}
            onEvaluationChange={onEvaluationChange}
            onCommentChange={onCommentChange}
            onSubmit={onEvaluationSubmit}
          />
        )}

        {children}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatContainer;
