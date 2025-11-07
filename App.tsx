
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { UploadedImage, ChatMessage } from './types';
import { DESIGN_STYLES } from './constants';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { StyleSelector } from './components/StyleSelector';
import { ChatInterface } from './components/ChatInterface';
import { generateStyledImage, editImage, sendMessage as sendChatMessage } from './services/geminiService';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [currentStyle, setCurrentStyle] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const chatRef = useRef<Chat | null>(null);

  const initChat = useCallback(() => {
    if (!chatRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are an AI interior design assistant. Your role is to help users refine their generated room designs. If asked for product recommendations, provide conceptual ideas and suggest types of stores where they might find such items (e.g., "vintage furniture stores," "online lighting retailers," or "local artisan markets"). Do not provide actual URLs or product links.',
                },
            });
        } catch(e) {
            console.error(e);
            setError("Failed to initialize the chat service. Please check your API key and refresh the page.");
        }
    }
  }, []);

  const handleImageUpload = (image: UploadedImage) => {
    setOriginalImage(image);
    setGeneratedImages({});
    setCurrentStyle(null);
    setChatHistory([]);
    setError(null);
    initChat();
  };

  const handleStyleSelect = async (style: string) => {
    if (!originalImage) return;

    setCurrentStyle(style);
    if (generatedImages[style]) {
      return; 
    }

    setIsLoading(true);
    setLoadingMessage(`Reimagining your room in ${style} style...`);
    setError(null);

    try {
      const newImageBase64 = await generateStyledImage(originalImage.base64, originalImage.mimeType, style);
      setGeneratedImages(prev => ({ ...prev, [style]: newImageBase64 }));
    } catch (e) {
      console.error(e);
      setError('Failed to generate image. Please try another style or image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!editPrompt || !currentStyle || !generatedImages[currentStyle]) {
      setError("Please select a style and enter an edit instruction.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`Applying edit: "${editPrompt}"...`);
    setError(null);
    
    const baseImageForEdit = generatedImages[currentStyle];
    const mimeType = originalImage?.mimeType || 'image/jpeg';

    try {
      const editedImageBase64 = await editImage(baseImageForEdit, mimeType, editPrompt);
      setGeneratedImages(prev => ({ ...prev, [currentStyle]: editedImageBase64 }));
      setEditPrompt('');
    } catch (e) {
      console.error(e);
      setError('Failed to edit image. The model may not be able to perform this request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatRef.current) {
        setError("Chat is not initialized.");
        return;
    }
  
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingMessage('AI is typing...');
    setError(null);
  
    try {
      const responseText = await sendChatMessage(chatRef.current, message);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      setError('Failed to get a response from the chat assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentGeneratedImage = currentStyle ? generatedImages[currentStyle] : null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md p-4 flex items-center justify-center sticky top-0 z-20">
        <HeaderIcon />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-700 ml-3">AI Interior Design Consultant</h1>
      </header>

      <main className="p-4 md:p-8">
        {!originalImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <ImageViewer
                originalImage={originalImage.base64}
                generatedImage={currentGeneratedImage}
              />
              <StyleSelector
                styles={DESIGN_STYLES}
                selectedStyle={currentStyle}
                onSelectStyle={handleStyleSelect}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-4 flex flex-col h-[80vh]">
              <ChatInterface
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                editPrompt={editPrompt}
                onEditPromptChange={setEditPrompt}
                onEditImage={handleEditImage}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                isImageGenerated={!!currentGeneratedImage}
              />
            </div>
          </div>
        )}
        {error && (
            <div className="fixed bottom-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-xl animate-pulse">
                <p><strong>Error:</strong> {error}</p>
                <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white font-bold">&times;</button>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
