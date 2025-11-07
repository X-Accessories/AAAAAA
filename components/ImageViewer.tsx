
import React, { useState, useRef, useEffect } from 'react';
import { CompareIcon } from './icons';

interface ImageViewerProps {
  originalImage: string;
  generatedImage: string | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  useEffect(() => {
    // Reset slider when a new image is generated
    setSliderPosition(50);
  }, [generatedImage]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 relative aspect-video flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="relative w-full h-full select-none">
        <img
          src={`data:image/png;base64,${originalImage}`}
          alt="Original room"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        />
        {generatedImage ? (
          <>
            <img
              src={`data:image/png;base64,${generatedImage}`}
              alt="AI generated design"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            />
            <div className="absolute top-0 left-0 w-full h-full">
                <div
                    className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md border border-gray-300">
                        <CompareIcon />
                    </div>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={handleSliderChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize"
                    aria-label="Compare original and generated image"
                />
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Original</div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">AI Generated</div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center animate-pulse">
            <p className="text-gray-500">Select a style below to begin...</p>
          </div>
        )}
      </div>
    </div>
  );
};
