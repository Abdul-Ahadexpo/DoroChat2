import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ImageMessageProps {
  imageUrl: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ imageUrl }) => {
  const [fullscreen, setFullscreen] = useState(false);

  const handleImageClick = () => {
    setFullscreen(true);
  };

  const closeFullscreen = () => {
    setFullscreen(false);
  };

  const downloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `dorochat-image-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="inline-block max-w-xs overflow-hidden">
        <img
          src={imageUrl}
          alt="Shared image"
          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleImageClick}
          loading="lazy"
        />
      </div>

      {fullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={imageUrl}
              alt="Fullscreen image"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={downloadImage}
                className="bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-100 transition-colors"
                aria-label="Download image"
              >
                <Download size={20} />
              </button>
              
              <button
                onClick={closeFullscreen}
                className="bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-100 transition-colors"
                aria-label="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageMessage;