import React, { useEffect, useRef, useState } from 'react';
import { getLiveVideoState, setLiveVideoState, removeLiveVideoState } from '../services/firebase';
import { LiveVideoState } from '../utils/types';
import { useUser } from '../contexts/UserContext';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

interface LiveYouTubePlayerProps {
  roomId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const LiveYouTubePlayer: React.FC<LiveYouTubePlayerProps> = ({ roomId }) => {
  const [liveVideoState, setLiveVideoStateLocal] = useState<LiveVideoState | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Listen for live video state changes
  useEffect(() => {
    const unsubscribe = getLiveVideoState(roomId, (state) => {
      setLiveVideoStateLocal(state);
    });

    return unsubscribe;
  }, [roomId]);

  // Initialize or update player when state changes
  useEffect(() => {
    if (!isAPIReady || !liveVideoState || !playerRef.current) return;

    if (!player) {
      // Create new player
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: '315',
        width: '560',
        videoId: liveVideoState.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            syncVideoTime(event.target, liveVideoState);
          },
          onStateChange: (event: any) => {
            handlePlayerStateChange(event);
          },
        },
      });
    } else if (player.getVideoData && player.getVideoData().video_id !== liveVideoState.videoId) {
      // Load new video
      player.loadVideoById(liveVideoState.videoId);
      syncVideoTime(player, liveVideoState);
    } else {
      // Sync existing video
      syncVideoTime(player, liveVideoState);
    }
  }, [isAPIReady, liveVideoState, player]);

  // Update current time periodically
  useEffect(() => {
    if (!player || !liveVideoState?.isPlaying) return;

    const interval = setInterval(() => {
      if (player.getCurrentTime) {
        setCurrentTime(player.getCurrentTime());
      }
      if (player.getDuration) {
        setDuration(player.getDuration());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, liveVideoState?.isPlaying]);

  const syncVideoTime = (playerInstance: any, state: LiveVideoState) => {
    if (!playerInstance || !state) return;

    const now = Date.now();
    const elapsedTime = (now - state.startedAt) / 1000;
    const targetTime = state.currentPlaybackTime + elapsedTime;

    // Clear any existing sync timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Small delay to ensure player is ready
    syncTimeoutRef.current = setTimeout(() => {
      if (playerInstance.seekTo) {
        playerInstance.seekTo(targetTime, true);
        
        if (state.isPlaying) {
          playerInstance.playVideo();
        } else {
          playerInstance.pauseVideo();
        }
      }
    }, 100);
  };

  const handlePlayerStateChange = (event: any) => {
    // Prevent infinite loops by checking if this user initiated the change
    if (!liveVideoState || liveVideoState.initiatedBy === user.id) return;

    const playerState = event.data;
    const YT = window.YT;

    if (playerState === YT.PlayerState.PLAYING && !liveVideoState.isPlaying) {
      // Someone else started playing, sync
      syncVideoTime(event.target, liveVideoState);
    } else if (playerState === YT.PlayerState.PAUSED && liveVideoState.isPlaying) {
      // Someone else paused, sync
      syncVideoTime(event.target, liveVideoState);
    }
  };

  const handlePlay = async () => {
    if (!player || !liveVideoState) return;

    const currentPlaybackTime = player.getCurrentTime();
    const newState: LiveVideoState = {
      ...liveVideoState,
      isPlaying: true,
      startedAt: Date.now(),
      currentPlaybackTime,
      initiatedBy: user.id,
      initiatedByName: user.name,
    };

    await setLiveVideoState(roomId, newState);
  };

  const handlePause = async () => {
    if (!player || !liveVideoState) return;

    const currentPlaybackTime = player.getCurrentTime();
    const newState: LiveVideoState = {
      ...liveVideoState,
      isPlaying: false,
      startedAt: Date.now(),
      currentPlaybackTime,
      initiatedBy: user.id,
      initiatedByName: user.name,
    };

    await setLiveVideoState(roomId, newState);
  };

  const handleStop = async () => {
    if (!player) return;
    
    player.stopVideo();
    await removeLiveVideoState(roomId);
  };

  const handleSeek = async (seekTime: number) => {
    if (!player || !liveVideoState) return;

    const newState: LiveVideoState = {
      ...liveVideoState,
      startedAt: Date.now(),
      currentPlaybackTime: seekTime,
      initiatedBy: user.id,
      initiatedByName: user.name,
    };

    await setLiveVideoState(roomId, newState);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;
    
    setVolume(newVolume);
    player.setVolume(newVolume);
  };

  const toggleMute = () => {
    if (!player) return;
    
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!liveVideoState) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-comic">
            🔴 Live Video Session
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Started by {liveVideoState.initiatedByName}
          </p>
        </div>
        <button
          onClick={handleStop}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Stop live session"
        >
          <Square size={20} />
        </button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <div ref={playerRef} className="w-full aspect-video" />
      </div>

      <div className="space-y-3">
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={liveVideoState.isPlaying ? handlePause : handlePlay}
            className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full transition-colors"
          >
            {liveVideoState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, #8B5CF6 ${(currentTime / (duration || 1)) * 100}%, #E5E7EB ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, #8B5CF6 ${volume}%, #E5E7EB ${volume}%)`,
            }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
            {volume}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveYouTubePlayer;