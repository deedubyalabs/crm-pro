'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Paperclip, Image as ImageIcon, Send, Loader } from 'lucide-react'; // Renamed Image to ImageIcon to avoid conflict
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Message, Attachment } from './types'; // Adjusted import path

interface ConversationInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  isProcessing?: boolean;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  messages,
  onSendMessage,
  isProcessing = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null); // Add ref for the container
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100; // 100px threshold

      if (isNearBottom || messages.length <= 1) { // Also scroll for the very first message
        // Use scrollTop for potentially more reliable scrolling
        container.scrollTop = container.scrollHeight;
      }
    } else {
       // Fallback to scrollIntoView if container ref is not available
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Removed the separate scrollToBottom function as scrolling is now handled directly in useEffect

  const handleSendMessage = () => {
    if (inputValue.trim() || attachments.length > 0) {
      onSendMessage(inputValue, attachments.length > 0 ? attachments : undefined);
      setInputValue('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const attachment: Attachment = {
          id: uuidv4(),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: event.target?.result as string,
          name: file.name,
          size: file.size,
        };
        setAttachments((prev) => [...prev, attachment]);
      };

      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">New AI Estimate Conversation</h2>
        <p className="text-sm text-neutral-500">
          Describe the project scope, materials, and dimensions to get an accurate estimate. You can also upload relevant files or images.
        </p>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4"> {/* Attach ref here */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none' // Updated for shadcn/ui
                  : 'bg-muted text-muted-foreground rounded-tl-none' // Updated for shadcn/ui
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="rounded-md overflow-hidden">
                      {attachment.type === 'image' && (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-full h-auto rounded"
                        />
                      )}
                      {attachment.type === 'document' && (
                        <div className="flex items-center gap-2 p-2 bg-background rounded border"> {/* Updated for shadcn/ui */}
                          <Paperclip size={16} />
                          <span className="text-sm truncate">{attachment.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70' // Updated for shadcn/ui
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-lg rounded-tl-none max-w-[80%] p-3"> {/* Updated for shadcn/ui */}
              <div className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                <span className="text-muted-foreground">HomePro AI is thinking...</span> {/* Updated text */}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t"> {/* Updated for shadcn/ui */}
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full" /* Updated for shadcn/ui */
              >
                {attachment.type === 'image' ? (
                  <ImageIcon size={14} className="text-muted-foreground" /> // Updated for shadcn/ui
                ) : (
                  <Paperclip size={14} className="text-muted-foreground" /> // Updated for shadcn/ui
                )}
                <span className="text-xs truncate max-w-[150px]">{attachment.name}</span>
                <button
                  className="text-muted-foreground hover:text-destructive" // Updated for shadcn/ui
                  onClick={() => removeAttachment(attachment.id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t"> {/* Updated for shadcn/ui */}
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition min-h-[80px] bg-background text-foreground placeholder:text-muted-foreground" // Updated for shadcn/ui
            placeholder="Describe your project here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2">
            <button
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors" // Updated for shadcn/ui
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <Paperclip size={20} />
            </button>
            <button
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors" // Updated for shadcn/ui
              title="Use voice input (coming soon)"
              disabled // Voice input not implemented yet
            >
              <Mic size={20} />
            </button>
            <button
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary" // Updated for shadcn/ui
              onClick={handleSendMessage}
              disabled={isProcessing || (!inputValue.trim() && attachments.length === 0)}
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelection}
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" // Added .txt
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ConversationInterface;
