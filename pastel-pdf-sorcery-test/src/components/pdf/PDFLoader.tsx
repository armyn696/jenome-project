import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { toast } from 'sonner';
import { storePdfFile } from '@/components/pdf/PDFStorage';

interface PDFLoaderProps {
  setIsLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setPdfPages: (pages: string[]) => void;
  setCurrentPdf: (pdf: PDFDocumentProxy | null) => void;
  setSelectedPages: (pages: number[]) => void;
  setCurrentPage: (page: number) => void;
}

export const compressImage = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/jpeg', 1.0);
};

export const PDFLoader = ({
  setIsLoading,
  setUploadProgress,
  setPdfPages,
  setCurrentPdf,
  setSelectedPages,
  setCurrentPage,
}: PDFLoaderProps) => {
  const loadPdfPages = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);
      console.log('Loading PDF file:', file.name);
      
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 50;
          setUploadProgress(progress);
        }
      };

      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        try {
          const arrayBuffer = e.target.result as ArrayBuffer;
          
          // Store the original PDF file
          await storePdfFile(arrayBuffer);
          
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          setCurrentPdf(pdf);
          
          const pages: string[] = [];
          const totalPages = pdf.numPages;
          
          for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
              console.error('Canvas context is null');
              continue;
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            pages.push(compressImage(canvas));
            
            const renderProgress = 50 + ((i / totalPages) * 50);
            setUploadProgress(renderProgress);
          }
          
          setPdfPages(pages);
          setSelectedPages([]);
          setCurrentPage(0);
          
          toast.success(`Successfully loaded ${pages.length} pages from PDF`);
        } catch (error) {
          console.error('Error processing PDF:', error);
          toast.error('Error processing PDF file');
        } finally {
          setIsLoading(false);
          setUploadProgress(0);
        }
      };

      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Error loading PDF file');
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return { loadPdfPages };
};