import React from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

// Function to detect and make URLs clickable
function makeLinksClickable(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:text-blue-200 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Function to detect if text contains image URLs
function extractImageUrls(text: string): string[] {
  const imageUrlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?/gi;
  return text.match(imageUrlRegex) || [];
}

// Function to check if a URL is an image
function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}

// Function to extract all URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  return text.match(urlRegex) || [];
}

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

// Function to preserve line breaks and convert them to JSX
function preserveLineBreaks(text: string): React.ReactNode[] {
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {makeLinksClickable(line)}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isAIResponse = message.text.includes('✨');
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Extract image URLs from the message
  const urls = extractUrls(message.text);
  const imageUrls = urls.filter(isImageUrl);
  
  // Remove image URLs from text to avoid duplication
  let textWithoutImages = message.text;
  imageUrls.forEach(url => {
    textWithoutImages = textWithoutImages.replace(url, '').trim();
  });

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-6 px-3 md:px-0 ${
        isLatest ? (isUser ? 'animate-slide-in-right' : 'animate-slide-in-left') : ''
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-3xl px-4 sm:px-5 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift relative ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white ml-auto'
            : 'bg-gradient-to-br from-slate-800 via-slate-750 to-slate-700 text-white border border-slate-600/50 mr-auto'
        }`}
      >
        {/* AI Badge for bot messages */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-slate-600/30">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <span className="text-xs text-slate-300 font-medium">SenTorial Assistant</span>
          </div>
        )}
        
        {textWithoutImages && (
          <div className="text-sm sm:text-base leading-relaxed mb-2 break-words">
            {isAIResponse && !isUser ? (
              <MarkdownRenderer text={textWithoutImages} />
            ) : (
              <div className="whitespace-pre-wrap">
                {preserveLineBreaks(textWithoutImages)}
              </div>
            )}
          </div>
        )}
        
        {imageUrls.length > 0 && (
          <div className="space-y-2 sm:space-y-3 animate-scale-in">
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt="Shared image"
                  className="w-full max-w-full h-auto rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                  style={{ maxHeight: '250px', objectFit: 'cover' }}
                  onClick={() => window.open(imageUrl, '_blank')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show the URL as text if image fails to load
                    const fallback = document.createElement('p');
                    fallback.textContent = imageUrl;
                    fallback.className = 'text-xs text-gray-300 bg-gray-700 p-2 rounded break-all';
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
          <p className={`text-xs opacity-75 ${isUser ? 'text-purple-100' : 'text-slate-300'}`}>
            {time}
          </p>
          {!isUser && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">AI Response</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}