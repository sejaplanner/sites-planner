
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecordingHook {
  isRecording: boolean;
  audioBlob: Blob | null;
  recordingTime: number;
  hasError: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendAudio: (onAudioRecorded: (audioBlob: Blob) => void) => Promise<void>;
  cancelAudio: () => void;
  retryAudio: (onAudioRecorded: (audioBlob: Blob) => void) => void;
}

// Detecta se é dispositivo móvel iOS
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detecta se é Android
const isAndroidDevice = () => {
  return /Android/.test(navigator.userAgent);
};

// Detecta se é móvel em geral
const isMobileDevice = () => {
  return isIOSDevice() || isAndroidDevice() || window.innerWidth <= 768;
};

// Configurações de áudio por plataforma
const getAudioConfig = () => {
  const baseConfig = {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };

  if (isIOSDevice()) {
    // iOS Safari funciona melhor com configurações específicas
    return {
      ...baseConfig,
      sampleRate: 16000, // iOS Safari prefere 16kHz
    };
  }

  return baseConfig;
};

// Seleciona o melhor mimeType por plataforma
const getBestMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg;codecs=opus'
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('🎤 MimeType selecionado:', type, 'Plataforma:', {
        iOS: isIOSDevice(),
        Android: isAndroidDevice(),
        Mobile: isMobileDevice()
      });
      return type;
    }
  }

  console.warn('⚠️ Nenhum mimeType suportado encontrado, usando padrão');
  return 'audio/webm';
};

export const useAudioRecording = (): AudioRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      setHasError(false);
      console.log('🎤 Iniciando gravação - Plataforma:', {
        iOS: isIOSDevice(),
        Android: isAndroidDevice(),
        Mobile: isMobileDevice(),
        userAgent: navigator.userAgent
      });

      const audioConfig = getAudioConfig();
      console.log('🎤 Configuração de áudio:', audioConfig);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConfig
      });
      streamRef.current = stream;
      
      const mimeType = getBestMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('🎤 Chunk recebido:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        console.log('🎤 Áudio gravado:', {
          size: blob.size,
          type: blob.type,
          platform: {
            iOS: isIOSDevice(),
            Android: isAndroidDevice(),
            Mobile: isMobileDevice()
          }
        });
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ Erro no MediaRecorder:', event);
        setHasError(true);
        toast({
          title: "Erro na gravação",
          description: "Falha durante a gravação de áudio.",
          variant: "destructive",
        });
      };
      
      mediaRecorder.start(1000); // Coleta chunks a cada 1 segundo
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador de tempo
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('✅ Gravação iniciada com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao acessar microfone:', error);
      setHasError(true);
      
      let errorMessage = "Não foi possível acessar o microfone.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permissão negada. Permita o acesso ao microfone nas configurações.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Microfone não encontrado. Verifique se está conectado.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Gravação de áudio não suportada neste navegador.";
        }
      }
      
      toast({
        title: "Erro no microfone",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Parando gravação...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Track parado:', track.kind);
        });
      }
    }
  };

  const sendAudio = async (onAudioRecorded: (audioBlob: Blob) => void) => {
    if (audioBlob && !isProcessing) {
      setIsProcessing(true);
      try {
        console.log('📤 Enviando áudio para transcrição...');
        await onAudioRecorded(audioBlob);
        setAudioBlob(null);
        setRecordingTime(0);
        setHasError(false);
        console.log('✅ Áudio processado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao processar áudio:', error);
        setHasError(true);
        toast({
          title: "Erro na transcrição",
          description: "Falha ao processar o áudio. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setHasError(false);
  };

  const retryAudio = (onAudioRecorded: (audioBlob: Blob) => void) => {
    setHasError(false);
    sendAudio(onAudioRecorded);
  };

  return {
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
  };
};
