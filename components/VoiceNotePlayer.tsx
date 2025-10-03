import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { getVoiceNote } from '../utils/storage';

interface VoiceNotePlayerProps {
  roomId: string;
  voiceNoteId: string;
  audioUrl: string;
}

const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ roomId, voiceNoteId, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  // Try to load from local storage first, then fallback to Firebase URL
  useEffect(() => {
    const localAudio = getVoiceNote(roomId, voiceNoteId);
    
    if (localAudio) {
      setAudioSrc(localAudio);
    } else {
      setAudioSrc(audioUrl);
    }
  }, [roomId, voiceNoteId, audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationRef.current!);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(animationRef.current!);
    };
  }, [audioSrc]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animationRef.current!);
    } else {
      audio.play()
        .catch(error => console.error("Error playing audio:", error));
      animationRef.current = requestAnimationFrame(updateProgress);
    }

    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(audio.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    audio.currentTime = value;
  };

  const downloadVoiceNote = () => {
    if (!audioSrc) return;
    
    try {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = audioSrc;
      a.download = `voice-note-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading voice note:', error);
    }
  };

  // Format time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 w-full max-w-xs md:max-w-sm">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}
      
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full mr-2"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={onSeek}
          className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, #8B5CF6 ${(currentTime / (duration || 1)) * 100}%, #D1D5DB ${(currentTime / (duration || 1)) * 100}%)`,
          }}
        />
        
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="flex items-center ml-2 space-x-1">
        <Volume2 size={14} className="text-gray-500 dark:text-gray-400" />
        <button
          onClick={downloadVoiceNote}
          className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-1"
          aria-label="Download voice note"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default VoiceNotePlayer;