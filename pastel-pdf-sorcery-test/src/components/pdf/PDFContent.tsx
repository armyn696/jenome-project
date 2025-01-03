import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFThumbnails } from './PDFThumbnails';
import { PDFPreview } from './PDFPreview';

interface PDFContentProps {
  pages: string[];
  selectedPages: number[];
  currentPage: number;
  onPageSelect: (pageNum: number) => void;
  onDelete: () => void;
  onSplit: () => void;
  onDeletePage: (pageNum: number) => void;
}

export const PDFContent: React.FC<PDFContentProps> = ({
  pages,
  selectedPages,
  currentPage,
  onPageSelect,
  onDelete,
  onSplit,
  onDeletePage,
}) => {
  const [leftPanelSize, setLeftPanelSize] = useState(50);

  const getGridCols = (size: number) => {
    if (size < 30) return 'grid-cols-1';
    if (size < 60) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className="grid grid-cols-1 gap-2 mt-2 h-[calc(90vh-4rem)]">
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel 
          defaultSize={50} 
          minSize={20} 
          maxSize={80}
          onResize={setLeftPanelSize}
        >
          <PDFThumbnails
            pages={pages}
            selectedPages={selectedPages}
            onPageSelect={onPageSelect}
            onDelete={onDelete}
            onSplit={onSplit}
            onDeletePage={onDeletePage}
            gridCols={getGridCols(leftPanelSize)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={20}>
          <PDFPreview
            pages={pages}
            selectedPage={currentPage}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};