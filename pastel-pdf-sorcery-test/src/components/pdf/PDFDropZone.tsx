import React, { useState, useCallback } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const PDFDropZone = ({ onFileSelect, isLoading }: PDFDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
    }
  }, [onFileSelect]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      className={cn(
        "relative h-full w-full flex flex-col items-center justify-center",
        "border-2 border-dashed rounded-xl transition-all duration-200",
        "bg-gradient-to-br from-primary/50 via-secondary/50 to-accent/50",
        isDragging && "border-primary bg-primary/20",
        !isDragging && "border-primary/40"
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="pdf-upload"
        disabled={isLoading}
      />
      
      <div className="animate-[bounce_6s_ease-in-out_infinite] hover:animate-none">
        <FileUp className="w-16 h-16 text-primary-foreground/60 mb-4 transition-all duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-primary-foreground/80 mb-2">
        Drag & Drop your PDF here
      </h3>
      <p className="text-primary-foreground/60 mb-4">or</p>
      <Button
        variant="secondary"
        onClick={() => document.getElementById('pdf-upload')?.click()}
        disabled={isLoading}
        className="bg-primary/80 hover:bg-primary text-primary-foreground"
      >
        Choose PDF
      </Button>
    </div>
  );
};