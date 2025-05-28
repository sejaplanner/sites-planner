
import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
  audioBlob?: Blob;
}

export const useChatState = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<number>(0);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🔧 useChatState inicializado para sessão:', sessionId);

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    setIsLoading,
    files,
    setFiles,
    isCompleted,
    setIsCompleted,
    isEvaluating,
    setIsEvaluating,
    evaluation,
    setEvaluation,
    evaluationComment,
    setEvaluationComment,
    currentProgress,
    setCurrentProgress,
    isInitialized,
    setIsInitialized
  };
};

export type { Message };
