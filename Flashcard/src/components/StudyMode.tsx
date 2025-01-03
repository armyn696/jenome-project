import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, BookOpenCheck, Trash2 } from 'lucide-react';
import { Flashcard } from './Flashcard';

interface StudyModeProps {
  cards: Array<{ front: string; back: string; category?: string }>;
  onClose: () => void;
  onDelete: (index: number) => void;
}

export function StudyMode({ cards, onClose, onDelete }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState([...cards]);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const newCards = [...shuffledCards];
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    setShuffledCards(newCards);
    setCurrentIndex(0);
  };

  const handleDelete = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این فلش کارت را حذف کنید؟')) {
      onDelete(currentIndex);
      setShuffledCards(prev => prev.filter((_, i) => i !== currentIndex));
      if (currentIndex === shuffledCards.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  if (shuffledCards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No flashcards available. Create some first!</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="study-mode-title">
          <BookOpenCheck size={32} className="text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">Study Mode</h1>
        </div>

        <div className="flex items-center justify-center gap-8 w-full">
          <button
            onClick={handlePrev}
            className="p-4 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="study-card-container flex-1 max-w-[900px]">
            <Flashcard 
              {...shuffledCards[currentIndex]} 
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
          </div>

          <button
            onClick={handleNext}
            className="p-4 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Card {currentIndex + 1} of {shuffledCards.length}
          </div>
          
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Shuffle size={16} />
            Shuffle Cards
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            حذف کارت
          </button>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Exit Study Mode
        </button>
      </div>
    </div>
  );
}