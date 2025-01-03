import React from 'react';
import { Merge, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFHeaderProps {
  isLoading: boolean;
  onMerge: () => void;
  onChatClick: () => void;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ isLoading, onMerge, onChatClick }) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-2xl font-semibold text-gray-800">PDF Manager</h1>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={onMerge}
          disabled={isLoading}
          className="h-8"
        >
          <Merge className="w-4 h-4 mr-2" />
          Merge PDF
        </Button>
        <Button
          onClick={onChatClick}
          disabled={isLoading}
          className="h-8 bg-[#9b87f5] hover:bg-[#7E69AB] text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 animate-fadeIn"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat with PDF
        </Button>
      </div>
    </div>
  );
};