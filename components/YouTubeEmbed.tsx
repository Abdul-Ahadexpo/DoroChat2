import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, extractYouTubeId } from '../utils/youtube';

interface YouTubeEmbedProps {
  url: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
        <p className="text-red-600 dark:text-red-400 text-sm">Invalid YouTube URL</p>
      </div>
    );
  }
  
  const embedUrl = getYouTubeEmbedUrl(videoId);
  const thumbnailUrl = getYouTubeThumbnail(videoId);
  
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const openInNewTab = () => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      {!isPlaying ? (
        <div className="relative group cursor-pointer" onClick={handlePlay}>
          {!imageError ? (
            <img
              src={thumbnailUrl}
              alt="YouTube video thumbnail"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <div className="text-white text-center">
                <Play size={48} className="mx-auto mb-2" />
                <p className="text-sm font-medium">YouTube Video</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 text-white rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
              <Play size={24} fill="white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <iframe
            src={embedUrl}
            title="YouTube video"
            className="w-full h-48"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
            <Play size={12} fill="white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Video</span>
        </div>
        
        <button
          onClick={openInNewTab}
          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          aria-label="Open in YouTube"
        >
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

export default YouTubeEmbed;