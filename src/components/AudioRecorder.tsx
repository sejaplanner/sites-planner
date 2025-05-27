
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador de tempo
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const sendAudio = () => {
    if (audioBlob) {
      onAudioRecorded(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-600">{formatTime(recordingTime)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="h-8 w-8 text-red-600 hover:bg-red-100"
        >
          <MicOff className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Mic className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-600">Áudio gravado</div>
            <div className="text-xs text-gray-500">{formatTime(recordingTime)}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelAudio}
          className="h-6 w-6 text-gray-500 hover:text-gray-700"
        >
          <X className="w-3 h-3" />
        </Button>
        <Button
          onClick={sendAudio}
          size="icon"
          className="h-8 w-8 bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startRecording}
      className="h-10 w-10"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
};

export default AudioRecorder;
