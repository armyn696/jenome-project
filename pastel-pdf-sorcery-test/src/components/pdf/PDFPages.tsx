import { useState, useRef, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PDFPagesProps {
  pdfPages: string[];
  selectedPages: number[];
  onPageSelect: (pageNum: number) => void;
}

export const PDFPages = ({ pdfPages, selectedPages, onPageSelect }: PDFPagesProps) => {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [leftPanelSize, setLeftPanelSize] = useState(50);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPreview && previewRef.current) {
      const selectedIndex = pdfPages.indexOf(selectedPreview);
      const pageElements = previewRef.current.getElementsByClassName('preview-page');
      if (selectedIndex >= 0 && pageElements[selectedIndex]) {
        pageElements[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedPreview, pdfPages]);

  if (pdfPages.length === 0) return null;

  const getGridCols = (size: number) => {
    if (size < 30) return 'grid-cols-1';
    if (size < 60) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  const handlePageClick = (pageUrl: string, index: number) => {
    console.log('Page clicked:', index + 1);
    setSelectedPreview(pageUrl);
    onPageSelect(index + 1);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
      <ResizablePanel 
        defaultSize={50} 
        minSize={20}
        maxSize={80}
        onResize={setLeftPanelSize}
      >
        <ScrollArea className="h-full bg-gray-50 rounded-lg">
          <div className={`grid ${getGridCols(leftPanelSize)} gap-4 p-4`}>
            {pdfPages.map((pageUrl, index) => (
              <div
                key={index}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                  selectedPages.includes(index + 1) ? 'ring-4 ring-primary' : ''
                }`}
                onClick={() => handlePageClick(pageUrl, index)}
              >
                <img
                  src={pageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
                  Page {index + 1}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={50} minSize={20}>
        <ScrollArea className="h-full bg-white rounded-lg">
          <div ref={previewRef} className="relative w-full h-full p-4">
            {selectedPreview ? (
              pdfPages.map((pageUrl, index) => (
                <div
                  key={index}
                  className={`preview-page relative w-full mb-4 ${
                    pageUrl === selectedPreview ? 'ring-4 ring-primary' : ''
                  }`}
                >
                  <img
                    src={pageUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
                    Page {index + 1}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a page to preview
              </div>
            )}
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};