import { GoogleGenerativeAI } from '@google/generative-ai';

interface Flashcard {
    front: string;
    back: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export async function createFlashcardsFromText(
    text: string, 
    count: number = 3,
    difficulty: Difficulty = 'mixed'
): Promise<Flashcard[]> {
    try {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            throw new Error('VITE_GEMINI_API_KEY is not set');
        }

        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            }
        });

        let difficultyPrompt = '';
        switch(difficulty) {
            case 'easy':
                difficultyPrompt = 'سوالات ساده و پایه‌ای طراحی کن که روی مفاهیم اصلی تمرکز داشته باشند.';
                break;
            case 'medium':
                difficultyPrompt = 'سوالات با سختی متوسط طراحی کن که نیاز به درک ارتباط بین مفاهیم داشته باشند.';
                break;
            case 'hard':
                difficultyPrompt = 'سوالات چالش‌برانگیز و پیشرفته طراحی کن که نیاز به تحلیل عمیق و درک کامل مطلب داشته باشند.';
                break;
            default:
                difficultyPrompt = 'ترکیبی از سوالات ساده، متوسط و سخت طراحی کن.';
        }

        const prompt = `لطفاً دقیقاً ${count} فلش کارت از متن زیر بساز. ${difficultyPrompt}
        نکات مهم:
        1. همه سوالات و جواب‌ها باید به زبان فارسی باشند
        2. سوالات باید دقیق و مرتبط با مفاهیم کلیدی متن باشند
        3. پاسخ‌ها باید کامل و قابل فهم باشند
        4. فقط و فقط یک آرایه JSON با این فرمت دقیق برگردان (بدون هیچ متن اضافه یا کد بلاک):
        [
            {
                "front": "سوال اول",
                "back": "پاسخ اول"
            },
            {
                "front": "سوال دوم",
                "back": "پاسخ دوم"
            },
            ...
        ]
        
        متن ورودی: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text_response = response.text();
        
        // Remove markdown code block if present
        text_response = text_response.replace(/```json\n|\n```/g, '');
        
        try {
            const parsed = JSON.parse(text_response.trim());
            if (!Array.isArray(parsed)) {
                return [parsed];
            }
            return parsed;
        } catch (parseError) {
            const jsonMatch = text_response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (!Array.isArray(parsed)) {
                        return [parsed];
                    }
                    return parsed;
                } catch (e) {
                    console.error('خطایی در تجزیه JSON استخراج شده رخ داد:', jsonMatch[0]);
                    throw new Error('فرمت پاسخ AI نامعتبر است');
                }
            }
            console.error('خطایی در تجزیه پاسخ AI رخ داد:', text_response);
            throw new Error('فرمت پاسخ AI نامعتبر است');
        }
    } catch (error) {
        console.error('خطایی در ایجاد فلش کارت‌ها رخ داد:', error);
        throw error;
    }
}
