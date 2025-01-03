import React, { useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  
  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalIsFlipped(!internalIsFlipped);
    }
  };

  const isCardFlipped = isFlipped !== undefined ? isFlipped : internalIsFlipped;

  return (
    <div className="card flashcard" onClick={handleClick}>
      <div className={`content ${isCardFlipped ? 'flipped' : ''}`}>
        <div className="back">
          <div className="back-content">
            <div className="flex flex-col items-end px-4 text-right w-full" dir="rtl">
              <strong className="text-2xl mb-3 w-full text-right">Question</strong>
              <p className="text-lg opacity-90 w-full text-right whitespace-pre-wrap">{front}</p>
            </div>
          </div>
        </div>
        <div className="front">
          <div className="img">
            <div className="circle"></div>
            <div className="circle" id="right"></div>
            <div className="circle" id="bottom"></div>
          </div>

          <div className="front-content">
            <div className="description">
              <div className="title">
                <div className="w-full" dir="rtl">
                  <div className="flex flex-col items-end px-4 text-right w-full" dir="rtl">
                    <strong className="text-lg mb-2 w-full text-right">Answer</strong>
                    <p className="text-sm opacity-90 w-full text-right whitespace-pre-wrap">{back}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}