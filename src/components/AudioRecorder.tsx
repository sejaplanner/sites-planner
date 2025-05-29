
import React from 'react';
import { Mic, Square, Send, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, disabled = false }) => {
  const {
    isRecording,
    audioBlob,
    recordingTime,
    hasError,
    isProcessing,
    startRecording,
    stopRecording,
    sendAudio,
    cancelAudio,
    retryAudio
  } = useAudioRecording();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
          <span className="text-sm text-red-600 font-medium whitespace-nowrap">{formatTime(recordingTime)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="h-8 w-8 text-red-600 hover:bg-red-100 flex-shrink-0"
          aria-label="Parar gravação"
        >
          <Square className="w-4 h-4 fill-current" />
        </Button>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 min-w-0 ${
        hasError ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            hasError ? 'bg-red-100' : 'bg-purple-100'
          }`}>
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Mic className="w-4 h-4 text-purple-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium truncate ${
              hasError ? 'text-red-600' : 'text-gray-600'
            }`}>
              {hasError ? 'Erro na transcrição' : 'Áudio gravado'}
            </div>
            <div className="text-xs text-gray-500">{formatTime(recordingTime)}</div>
          </div>
        </div>
        
        {hasError && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => retryAudio(onAudioRecorded)}
            disabled={isProcessing}
            className="h-6 w-6 text-red-600 hover:text-red-700 flex-shrink-0"
            aria-label="Tentar novamente"
          >
            <Send className="w-3 h-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelAudio}
          className="h-6 w-6 text-gray-500 hover:text-gray-700 flex-shrink-0"
          aria-label="Cancelar áudio"
        >
          <X className="w-3 h-3" />
        </Button>
        
        {!hasError && (
          <Button
            onClick={() => sendAudio(onAudioRecorded)}
            size="icon"
            disabled={isProcessing}
            className="h-8 w-8 bg-purple-600 hover:bg-purple-700 flex-shrink-0"
            aria-label="Enviar áudio"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startRecording}
      className="h-10 w-10 md:h-11 md:w-11 shrink-0 touch-manipulation"
      disabled={disabled}
      aria-label="Gravar áudio"
    >
      <Mic className="w-4 h-4 md:w-5 md:h-5" />
    </Button>
  );
};

export default AudioRecorder;
