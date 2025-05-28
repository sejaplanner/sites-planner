
import React, { useRef } from 'react';
import { Send, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudioRecorder from './AudioRecorder';
import ImagePreview from './ImagePreview';

interface MessageInputProps {
  inputValue: string;
  files: File[];
  isLoading: boolean;
  isCompleted: boolean;
  isEvaluating: boolean;
  onInputChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSendMessage: () => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  files,
  isLoading,
  isCompleted,
  isEvaluating,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSendMessage,
  onAudioRecorded,
  onKeyPress
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t bg-white p-3 md:p-4 relative z-10 flex-shrink-0 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <ImagePreview 
                key={index} 
                file={file} 
                onRemove={() => onRemoveFile(index)} 
                showRemove={true} 
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 w-full min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-10 w-10"
            disabled={isCompleted || isEvaluating}
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <AudioRecorder onAudioRecorded={onAudioRecorded} />
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
          />
          
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={
              isCompleted 
                ? "Briefing finalizado" 
                : isEvaluating 
                  ? "Aguardando avaliação..." 
                  : "Digite sua resposta..."
            }
            className="flex-1 text-sm md:text-base min-w-0"
            disabled={isLoading || isCompleted || isEvaluating}
          />
          
          <Button
            onClick={onSendMessage}
            disabled={isLoading || isCompleted || isEvaluating || (!inputValue.trim() && files.length === 0)}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 w-10"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
