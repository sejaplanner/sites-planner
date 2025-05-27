
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  audioBlob: Blob;
  isUserMessage?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBlob, isUserMessage = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioUrl = URL.createObjectURL(audioBlob);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
    }
    
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioBlob]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${
      isUserMessage ? 'bg-white/20' : 'bg-gray-100'
    }`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={`h-8 w-8 rounded-full ${
          isUserMessage ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      
      <div className="flex-1">
        <div className={`h-1 rounded-full ${
          isUserMessage ? 'bg-white/30' : 'bg-gray-300'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isUserMessage ? 'bg-white' : 'bg-purple-500'
            }`}
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>
      
      <span className={`text-xs ${
        isUserMessage ? 'text-white/80' : 'text-gray-600'
      }`}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default AudioPlayer;
