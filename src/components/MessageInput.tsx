
import React, { useRef, useState } from 'react';
import { Send, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setUploadingFiles(imageFiles);
      
      // Simular delay de processamento das imagens
      setTimeout(() => {
        onFileUpload(event);
        setUploadingFiles([]);
      }, 800);
    }
  };

  const isUploadingImages = uploadingFiles.length > 0;
  const canSendMessage = !isLoading && !isCompleted && !isEvaluating && !isUploadingImages && (inputValue.trim() || files.length > 0);

  return (
    <div className="border-t bg-white p-2 md:p-4 relative z-10 flex-shrink-0 w-full max-w-full">
      <div className="max-w-4xl mx-auto w-full">
        {(files.length > 0 || isUploadingImages) && (
          <div className="mb-2 md:mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <ImagePreview 
                key={index} 
                file={file} 
                onRemove={() => onRemoveFile(index)} 
                showRemove={true} 
              />
            ))}
            
            {/* Loading skeletons para imagens sendo processadas */}
            {uploadingFiles.map((file, index) => (
              <div key={`uploading-${index}`} className="relative">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
                <div className="absolute -bottom-1 left-0 right-0 text-center">
                  <span className="text-xs text-gray-500 bg-white px-1 rounded">
                    Processando...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 md:gap-2 w-full min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-9 w-9 md:h-10 md:w-10 touch-manipulation"
            disabled={isCompleted || isEvaluating || isUploadingImages}
            aria-label="Enviar arquivo"
          >
            {isUploadingImages ? (
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
            )}
          </Button>
          
          <AudioRecorder 
            onAudioRecorded={onAudioRecorded} 
            disabled={isCompleted || isEvaluating || isUploadingImages}
          />
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
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
                  : isUploadingImages
                    ? "Processando imagens..."
                    : "Digite sua resposta..."
            }
            className="flex-1 text-sm md:text-base min-w-0 h-9 md:h-10 touch-manipulation"
            disabled={isLoading || isCompleted || isEvaluating || isUploadingImages}
            style={{ fontSize: '16px' }} // Previne zoom no iOS
          />
          
          <Button
            onClick={handleSendClick}
            disabled={!canSendMessage}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-9 w-9 md:h-10 md:w-10 active:scale-95 transition-transform touch-manipulation"
            size="icon"
            type="button"
            aria-label="Enviar mensagem"
          >
            {isLoading || isUploadingImages ? (
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            )}
          </Button>
        </div>
        
        {/* Indicador de upload */}
        {isUploadingImages && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processando {uploadingFiles.length} imagem{uploadingFiles.length > 1 ? 's' : ''}...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
