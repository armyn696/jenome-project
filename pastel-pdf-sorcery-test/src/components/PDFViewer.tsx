import React, { useState, useEffect } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { ProgressBar } from './pdf/ProgressBar';
import { PDFDropZone } from './pdf/PDFDropZone';
import { PDFHeader } from './pdf/PDFHeader';
import { PDFContent } from './pdf/PDFContent';
import { useNavigate } from 'react-router-dom';
import { PDFLoader } from './pdf/PDFLoader';
import { storePdfPages } from './pdf/PDFStorage';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export const PDFViewer = () => {
  const navigate = useNavigate();
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPdf, setCurrentPdf] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  useEffect(() => {
    const savePdfPages = async () => {
      await storePdfPages(pdfPages);
    };
    savePdfPages();
  }, [pdfPages]);

  const handleChatClick = () => {
    if (pdfPages.length === 0) {
      toast.error("Please upload a PDF first");
      return;
    }
    navigate('/pdf-chat');
  };

  const { loadPdfPages } = PDFLoader({
    setIsLoading,
    setUploadProgress,
    setPdfPages,
    setCurrentPdf,
    setSelectedPages,
    setCurrentPage,
  });

  const handlePageSelect = (pageNum: number) => {
    console.log('Page selected:', pageNum);
    setCurrentPage(pageNum);
    setSelectedPages(prev => 
      prev.includes(pageNum) 
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum]
    );
  };

  const handleDelete = () => {
    if (selectedPages.length === 0) {
      toast.error("Please select pages to delete");
      return;
    }
    setPdfPages(prev => prev.filter((_, index) => !selectedPages.includes(index + 1)));
    setSelectedPages([]);
    setCurrentPage(0);
  };

  const handleDeletePage = (pageNum: number) => {
    setPdfPages(prev => prev.filter((_, index) => index !== pageNum - 1));
    setSelectedPages(prev => prev.filter(p => p !== pageNum));
    if (currentPage === pageNum) {
      setCurrentPage(0);
    }
  };

  const handleSplit = () => {
    if (selectedPages.length === 0) {
      toast.error("Please select pages to split at");
      return;
    }
    setPdfPages(prev => prev.filter((_, index) => selectedPages.includes(index + 1)));
    setSelectedPages([]);
    setCurrentPage(0);
  };

  const handleMerge = () => {
    toast.success("PDF merge functionality coming soon!");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primary via-secondary to-accent p-1">
      <div className="h-[95vh] max-w-[99.5%] mx-auto mt-4 bg-white rounded-xl shadow-lg p-2">
        <PDFHeader 
          isLoading={isLoading}
          onMerge={handleMerge}
          onChatClick={handleChatClick}
        />

        <ProgressBar progress={uploadProgress} isLoading={isLoading} />

        {pdfPages.length === 0 ? (
          <div className="h-[calc(90vh-2rem)]">
            <PDFDropZone onFileSelect={loadPdfPages} isLoading={isLoading} />
          </div>
        ) : (
          <PDFContent
            pages={pdfPages}
            selectedPages={selectedPages}
            currentPage={currentPage}
            onPageSelect={handlePageSelect}
            onDelete={handleDelete}
            onSplit={handleSplit}
            onDeletePage={handleDeletePage}
          />
        )}
      </div>
    </div>
  );
};