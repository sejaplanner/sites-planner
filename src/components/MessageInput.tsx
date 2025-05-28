
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, X } from 'lucide-react';
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
  inputRef: React.RefObject<HTMLInputElement>;
  onInputFocus: () => void;
  onInputBlur: () => void;
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
  onKeyPress,
  inputRef,
  onInputFocus,
  onInputBlur
}) => {
  if (isCompleted || isEvaluating) {
    return null;
  }

  return (
    <div className="message-input-container p-3 md:p-4 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Preview de arquivos */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <ImagePreview file={file} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end w-full">
          {/* Botão de anexo */}
          <div className="flex-shrink-0">
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 touch-manipulation"
                disabled={isLoading}
                type="button"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={onFileUpload}
              className="hidden"
            />
          </div>

          {/* Campo de input */}
          <div className="flex-1 min-w-0">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="w-full min-h-[40px] touch-manipulation"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          {/* Gravador de áudio */}
          <div className="flex-shrink-0">
            <AudioRecorder
              onAudioRecorded={onAudioRecorded}
              disabled={isLoading}
            />
          </div>

          {/* Botão de envio */}
          <div className="flex-shrink-0">
            <Button
              onClick={onSendMessage}
              disabled={isLoading || (!inputValue.trim() && files.length === 0)}
              size="sm"
              className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 touch-manipulation"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
