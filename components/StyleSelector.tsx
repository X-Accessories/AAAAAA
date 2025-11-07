
import React from 'react';

interface StyleSelectorProps {
  styles: string[];
  selectedStyle: string | null;
  onSelectStyle: (style: string) => void;
  isLoading: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">1. Select a Design Style</h3>
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-3">
        {styles.map(style => (
          <button
            key={style}
            onClick={() => onSelectStyle(style)}
            disabled={isLoading}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out whitespace-nowrap
              ${selectedStyle === style
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
              }
            `}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};
