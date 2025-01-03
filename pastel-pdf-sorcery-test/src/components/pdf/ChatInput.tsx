import React from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (message: string) => void;
  isWebSearchEnabled: boolean;
  setIsWebSearchEnabled: (enabled: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  message, 
  setMessage, 
  handleSendMessage,
  isWebSearchEnabled,
  setIsWebSearchEnabled
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSendMessage(message);
        setMessage('');
      }
    }
  };

  return (
    <div className="sticky bottom-0 px-4" style={{ backgroundColor: '#f8f8f9' }}>
      <div 
        className="flex items-center gap-0.5 w-full backdrop-blur-sm px-3 py-3 min-h-[3.5rem] bg-white rounded-t-xl shadow-sm"
        dir="rtl"
      >
        <Button 
          onClick={() => {
            if (message.trim()) {
              handleSendMessage(message);
              setMessage('');
            }
          }}
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Send className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <Textarea
            placeholder="سوال خود را درباره PDF بپرسید..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 text-right resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex items-center justify-center pt-7 max-h-[4.5rem]"
            dir="rtl"
            rows={1}
          />
          <button
            onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              isWebSearchEnabled 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div className={`w-6 h-3 rounded-full relative ${
              isWebSearchEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute w-2 h-2 rounded-full bg-white top-0.5 transition-transform duration-200 ${
                isWebSearchEnabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </div>
            Search web
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;