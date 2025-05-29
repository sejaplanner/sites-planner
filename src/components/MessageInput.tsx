
import React, { useRef, useState } from 'react';
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
  inputRef?: React.RefObject<HTMLInputElement>;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      console.log('📎 Processando upload de arquivos:', imageFiles.length);
      setUploadingFiles(imageFiles);
      setUploadProgress(0);
      
      // Progresso simulado mais realista
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      
      try {
        // Simular validação de arquivos
        const validFiles = imageFiles.filter(file => {
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            console.error('❌ Arquivo muito grande:', file.name);
            return false;
          }
          return true;
        });

        if (validFiles.length !== imageFiles.length) {
          throw new Error('Alguns arquivos são muito grandes (máximo 10MB)');
        }

        // Processar arquivos sem delay artificial
        onFileUpload(event);
        setUploadProgress(100);
        
        setTimeout(() => {
          setUploadingFiles([]);
          setUploadProgress(0);
        }, 300);
        
      } catch (error) {
        console.error('❌ Erro no upload:', error);
        setUploadingFiles([]);
        setUploadProgress(0);
      }
    }
  };

  const isUploadingImages = uploadingFiles.length > 0;
  const canSendMessage = !isLoading && !isCompleted && !isEvaluating && !isUploadingImages && (inputValue.trim() || files.length > 0);

  return (
    <div className="border-t bg-white/95 backdrop-blur-sm p-2 md:p-4 relative z-10 flex-shrink-0 w-full max-w-full">
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
            
            {/* Loading preview para imagens sendo processadas */}
            {uploadingFiles.map((file, index) => (
              <div key={`uploading-${index}`} className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
                <div className="absolute -bottom-1 left-0 right-0 text-center">
                  <div className="text-xs text-gray-500 bg-white px-1 rounded">
                    {Math.round(uploadProgress)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
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
            className="shrink-0 h-10 w-10 md:h-11 md:w-11 touch-manipulation"
            disabled={isCompleted || isEvaluating || isUploadingImages}
            aria-label="Enviar arquivo"
          >
            {isUploadingImages ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 md:w-5 md:h-5" />
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
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder={
              isCompleted 
                ? "Briefing finalizado" 
                : isEvaluating 
                  ? "Aguardando avaliação..." 
                  : isUploadingImages
                    ? "Processando imagens..."
                    : "Digite sua resposta..."
            }
            className="flex-1 text-base min-w-0 h-10 md:h-11 touch-manipulation px-3 md:px-4"
            disabled={isLoading || isCompleted || isEvaluating || isUploadingImages}
            style={{ fontSize: '16px' }} // Previne zoom no iOS
          />
          
          <Button
            onClick={handleSendClick}
            disabled={!canSendMessage}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-10 w-10 md:h-11 md:w-11 active:scale-95 transition-transform touch-manipulation"
            size="icon"
            type="button"
            aria-label="Enviar mensagem"
          >
            {isLoading || isUploadingImages ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
        </div>
        
        {/* Indicador de upload com progresso real */}
        {isUploadingImages && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processando {uploadingFiles.length} imagem{uploadingFiles.length > 1 ? 's' : ''}... {Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
