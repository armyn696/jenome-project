import React, { MutableRefObject, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { retrievePdfPages, retrievePdfFile } from '@/components/pdf/PDFStorage';
import { PDFDocument } from 'pdf-lib';

interface PDFViewerPanelProps {
  pageRefs: MutableRefObject<HTMLDivElement[]>;
  zoom: number;
  currentPage: number;
}

interface PDFViewerPanelRef {
  getCurrentPdf: () => Promise<Uint8Array | null>;
  isReady: () => boolean;
}

export const PDFViewerPanel = forwardRef(
  ({ pageRefs, zoom, currentPage }: PDFViewerPanelProps, ref: React.Ref<PDFViewerPanelRef>) => {
    const [pages, setPages] = useState<string[]>([]);
    const [pdfInstance, setPdfInstance] = useState<PDFDocument | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Function to get current PDF state
    const getCurrentPdf = async () => {
      // Wait for PDF to be ready
      let attempts = 0;
      while (!pdfInstance && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      if (!pdfInstance) {
        console.error('PDF instance not available after waiting');
        return null;
      }

      return await pdfInstance.save();
    };

    // Expose getCurrentPdf to parent
    useImperativeHandle(ref, () => ({
      getCurrentPdf,
      isReady: () => isReady,
    }));

    useEffect(() => {
      const loadPdf = async () => {
        try {
          setIsReady(false);
          const pdfFile = await retrievePdfFile();
          if (!pdfFile) {
            console.error('No PDF file found');
            return;
          }

          const loadedPdf = await PDFDocument.load(pdfFile);
          setPdfInstance(loadedPdf);
          setIsReady(true);
          console.log('PDF instance ready');
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      };

      loadPdf();
    }, [pages.length]); // Reload when pages change

    React.useEffect(() => {
      const loadPages = async () => {
        const pdfPages = await retrievePdfPages();
        setPages(pdfPages);
        // Update pageRefs array size
        pageRefs.current = new Array(pdfPages.length).fill(null);
      };
      loadPages();
    }, [pageRefs]);

    return (
      <div className="flex-1 flex flex-col h-full w-full bg-white relative">
        <div className="absolute top-0 left-0 right-0 z-50">
          {/* Sources will be rendered here */}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-auto w-full h-full">
          <div className="flex flex-col items-center">
            {pages.map((page, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) pageRefs.current[index] = el;
                }}
                className="relative my-4 bg-white border border-gray-200 shadow-sm"
                style={{
                  width: `${zoom}%`,
                  maxWidth: '100%'
                }}
              >
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto"
                  loading="lazy"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);