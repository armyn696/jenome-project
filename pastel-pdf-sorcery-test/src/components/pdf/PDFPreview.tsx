import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PDFPreviewProps {
  pages: string[];
  selectedPage: number;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ pages, selectedPage }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPage > 0 && previewRef.current) {
      console.log('Scrolling to page:', selectedPage);
      const pageElement = document.getElementById(`preview-page-${selectedPage}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedPage]);

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">No pages loaded</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-white rounded-lg">
      <div ref={previewRef} className="space-y-2 p-2">
        {pages.map((pageUrl, index) => (
          <div
            key={index}
            id={`preview-page-${index + 1}`}
            className={`relative aspect-[3/4] w-full ${
              selectedPage === index + 1 ? 'ring-4 ring-primary' : ''
            }`}
          >
            <img
              src={pageUrl}
              alt={`Page ${index + 1}`}
              className="w-full h-full object-contain bg-gray-50"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-center text-sm">
              Page {index + 1}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};