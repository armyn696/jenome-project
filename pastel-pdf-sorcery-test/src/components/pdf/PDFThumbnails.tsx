import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Split, Check } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface PDFThumbnailsProps {
  pages: string[];
  selectedPages: number[];
  onPageSelect: (pageNum: number) => void;
  onDelete: () => void;
  onSplit: () => void;
  onDeletePage: (pageNum: number) => void;
  gridCols: string;
}

export const PDFThumbnails: React.FC<PDFThumbnailsProps> = ({
  pages,
  selectedPages,
  onPageSelect,
  onDelete,
  onSplit,
  onDeletePage,
  gridCols,
}) => {
  const [isSelectMode, setIsSelectMode] = React.useState(false);

  const handlePageClick = (pageNum: number) => {
    console.log('Thumbnail clicked:', pageNum);
    onPageSelect(pageNum);
  };

  const handleDeletePage = (pageNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePage(pageNum);
    toast.success(`Page ${pageNum} deleted`);
  };

  // Get button size based on grid columns
  const getButtonSize = () => {
    if (gridCols === 'grid-cols-1') return 'sm';
    if (gridCols === 'grid-cols-2') return 'sm';
    return 'default';
  };

  // Get icon size based on grid columns
  const getIconSize = () => {
    if (gridCols === 'grid-cols-1') return 12;
    if (gridCols === 'grid-cols-2') return 14;
    return 16;
  };

  // Get button text class based on grid columns
  const getTextClass = () => {
    if (gridCols === 'grid-cols-1') return 'text-xs';
    if (gridCols === 'grid-cols-2') return 'text-sm';
    return 'text-base';
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();
  const textClass = getTextClass();

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-1">
        <Button
          variant={isSelectMode ? "secondary" : "outline"}
          onClick={() => setIsSelectMode(!isSelectMode)}
          className={`flex-1 h-8 ${textClass}`}
          size={buttonSize}
        >
          <Check className={`mr-1`} width={iconSize} height={iconSize} />
          {gridCols !== 'grid-cols-1' && (isSelectMode ? 'Cancel Selection' : 'Select')}
        </Button>
        {isSelectMode && (
          <>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={selectedPages.length === 0}
              className={`flex-1 h-8 ${textClass}`}
              size={buttonSize}
            >
              <Trash2 className={`mr-1`} width={iconSize} height={iconSize} />
              {gridCols !== 'grid-cols-1' && 'Delete Selected'}
            </Button>
            <Button
              variant="secondary"
              onClick={onSplit}
              disabled={selectedPages.length === 0}
              className={`flex-1 h-8 ${textClass}`}
              size={buttonSize}
            >
              <Split className={`mr-1`} width={iconSize} height={iconSize} />
              {gridCols !== 'grid-cols-1' && 'Split'}
            </Button>
          </>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className={`grid ${gridCols} gap-1 p-1`}>
          {pages.map((pageUrl, index) => (
            <div
              key={index}
              className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                selectedPages.includes(index + 1) && isSelectMode ? 'ring-4 ring-primary' : ''
              }`}
              onClick={() => handlePageClick(index + 1)}
            >
              <img
                src={pageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-contain bg-gray-50"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-center text-sm">
                Page {index + 1}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={(e) => handleDeletePage(index + 1, e)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};