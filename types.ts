
export interface UploadedImage {
  file: File;
  base64: string;
  mimeType: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
