
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, EditIcon, BotIcon, UserIcon } from './icons';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  editPrompt: string;
  onEditPromptChange: (prompt: string) => void;
  onEditImage: () => void;
  isLoading: boolean;
  loadingMessage: string;
  isImageGenerated: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatHistory,
  onSendMessage,
  editPrompt,
  onEditPromptChange,
  onEditImage,
  isLoading,
  loadingMessage,
  isImageGenerated,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = React.useState('');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEditImage();
    }
  };

  const isEditing = isLoading && loadingMessage.startsWith('Applying edit');
  const isGenerating = isLoading && loadingMessage.startsWith('Reimagining');
  const isTyping = isLoading && loadingMessage.startsWith('AI is typing');

  return (
    <div className="flex flex-col h-full">
      <div id="edit-section" className="mb-4 border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">2. Edit Your Design</h3>
        <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => onEditPromptChange(e.target.value)}
            placeholder='e.g., "Add a large plant"'
            disabled={!isImageGenerated || isLoading}
            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isImageGenerated || isLoading || !editPrompt.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Apply edit"
          >
            <EditIcon />
          </button>
        </form>
      </div>

      <div id="chat-section" className="flex flex-col flex-grow min-h-0">
        <h3 className="text-lg font-semibold mb-2">3. Chat with Your AI Assistant</h3>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 -mr-2 mb-2 space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div>}
              <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.parts.map((part, i) => <p key={i} className="whitespace-pre-wrap">{part.text}</p>)}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"><UserIcon /></div>}
            </div>
          ))}
          {isLoading && !isEditing && !isGenerating && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div>
              <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleChatSubmit} className="flex items-center gap-2 mt-auto">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask for refinements..."
            disabled={isLoading}
            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>

      {isLoading && (isEditing || isGenerating) && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
            <p className="mt-4 text-indigo-600 font-semibold">{loadingMessage}</p>
        </div>
      )}
    </div>
  );
};
