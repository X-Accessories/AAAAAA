
import React, { useState, useCallback } from 'react';
import { UploadedImage } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

const fileToData = (file: File): Promise<Omit<UploadedImage, 'file'>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setError(null);
      try {
        const { base64, mimeType } = await fileToData(file);
        onImageUpload({ file, base64, mimeType });
      } catch (err) {
        console.error("Error reading file:", err);
        setError("Could not process the image file.");
      }
    }
  }, [onImageUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="max-w-3xl mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-2">Upload a Photo of Your Room</h2>
      <p className="text-gray-600 mb-6">Let our AI reimagine your space. Start by uploading a clear, well-lit photo.</p>
      
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className={`w-10 h-10 mb-3 transition-colors duration-300 ${dragging ? 'text-indigo-600' : 'text-gray-400'}`} />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 10MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e.target.files)} />
      </label>
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
};
