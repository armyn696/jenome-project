import React, { useState } from 'react';
import { Flashcard } from './Flashcard';
import { StudyMode } from './StudyMode';
import { GraduationCap, BookOpen, Plus, BookOpenCheck, Trash2, Pencil } from 'lucide-react';
import { createFlashcardsFromText, Difficulty } from '../services/gemini';

export function FlashcardCreator() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [longText, setLongText] = useState('');
  const [cardCount, setCardCount] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [cards, setCards] = useState<Array<{ front: string; back: string }>>([]);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<{ index: number; front: string; back: string } | null>(null);

  const handleDeleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleEditCard = (index: number) => {
    setEditingCard({
      index,
      front: cards[index].front,
      back: cards[index].back
    });
    setFront(cards[index].front);
    setBack(cards[index].back);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front && back) {
      if (editingCard !== null) {
        setCards(cards.map((card, i) => 
          i === editingCard.index ? { front, back } : card
        ));
        setEditingCard(null);
      } else {
        setCards([...cards, { front, back }]);
      }
      setFront('');
      setBack('');
    }
  };

  const handleGenerateFromText = async () => {
    if (!longText.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await createFlashcardsFromText(longText, cardCount, difficulty);
      if (Array.isArray(results) && results.length > 0) {
        setCards([...cards, ...results]);
        setLongText('');
      } else {
        throw new Error('No valid flashcards generated');
      }
    } catch (error) {
      console.error('Error generating flashcard:', error);
      alert('خطا در ساخت فلش کارت. لطفاً متن دیگری را امتحان کنید یا بعداً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isStudyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 w-full">
        <div className="w-full">
          <StudyMode 
            cards={cards} 
            onClose={() => setIsStudyMode(false)}
            onDelete={handleDeleteCard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex gap-8">
          <div className="w-[40%] sticky top-8">
            <div className="flex items-center gap-3 mb-14">
              <BookOpen size={32} className="text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                {editingCard !== null ? 'Edit Flashcard' : 'Create New Flashcard'}
              </h1>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
                    Front Text
                  </label>
                  <input
                    type="text"
                    id="front"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
                    placeholder="Enter the question or term"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
                    Back Text
                  </label>
                  <input
                    type="text"
                    id="back"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
                    placeholder="Enter the answer or definition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="longText" className="block text-sm font-medium text-gray-700 mb-1">
                    Or Enter Long Text (AI will create flashcards)
                  </label>
                  <textarea
                    id="longText"
                    value={longText}
                    onChange={(e) => setLongText(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-gray-900"
                    placeholder="Enter a long text and AI will create flashcards for you"
                    rows={4}
                  />
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="cardCount" className="text-sm font-medium text-gray-700">
                        Number of Cards:
                      </label>
                      <select
                        id="cardCount"
                        value={cardCount}
                        onChange={(e) => setCardCount(Number(e.target.value))}
                        className="px-2 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                        Difficulty:
                      </label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="px-2 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                      >
                        <option value="mixed">Mixed</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateFromText}
                      disabled={isLoading || !longText.trim()}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Generating...' : 'Generate Flashcards'}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!front || !back}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCard !== null ? 'Save Changes' : 'Create Flashcard'}
                </button>
              </form>
            </div>
          </div>

          <div className="w-[60%] max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pr-4">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gradient-to-br from-blue-50 to-indigo-50 py-4 z-10">
              <h2 className="text-xl font-semibold text-gray-800">Your Flashcards</h2>
              <button
                onClick={() => setIsStudyMode(true)}
                disabled={cards.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Study Mode
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pr-2">
              {cards.map((card, index) => (
                <div key={index} className="relative group w-full mb-4">
                  <div className="absolute -top-5 left-3 flex flex-row gap-2 z-10">
                    <button
                      onClick={() => handleDeleteCard(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="حذف کارت"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleEditCard(index)}
                      className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg"
                      title="ویرایش کارت"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                  <Flashcard
                    front={card.front}
                    back={card.back}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}