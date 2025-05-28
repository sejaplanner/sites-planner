
import React from 'react';
import { Card } from '@/components/ui/card';
import MarkdownContent from '../MarkdownContent';
import AudioPlayer from '../AudioPlayer';
import ImagePreview from '../ImagePreview';
import { type Message } from '@/hooks/useChatState';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
      <Card className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 break-words overflow-hidden ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="text-sm md:text-base leading-relaxed break-words">
          {message.role === 'assistant' ? (
            <MarkdownContent content={message.content} />
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}
        </div>

        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.files.map((file, index) => (
              <ImagePreview key={index} file={file} />
            ))}
          </div>
        )}

        {message.audioBlob && (
          <div className="mt-3">
            <AudioPlayer audioBlob={message.audioBlob} isUserMessage={message.role === 'user'} />
          </div>
        )}

        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage;
