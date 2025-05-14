export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string; // This will be a base64 data URL from the frontend
  name: string;
  size: number;
}
