import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PDFViewerPanel } from '@/components/pdf/PDFViewerPanel';
import { PDFZoomControls } from '@/components/pdf/PDFZoomControls';
import { ChatMessage } from '@/components/pdf/ChatMessage';
import { ChatInput } from '@/components/pdf/ChatInput';
import { ArrowLeft, GripVertical, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { retrievePdfFile, retrievePdfPages } from '@/components/pdf/PDFStorage';
import { toast } from 'sonner';
import { geminiModel } from '@/lib/gemini';
import { PDFDocument } from 'pdf-lib';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const PDFChat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfTopic, setPdfTopic] = useState(""); // Add state for PDF topic
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const chatRef = useRef<any>(null);
  const pageRefs = useRef<HTMLDivElement[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const totalPagesRef = useRef(0);
  const pdfDocRef = useRef<PDFDocument | null>(null);
  const pdfViewerRef = useRef<any>(null);
  const chatHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const maxScrollTop = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight;
      messagesContainerRef.current.scrollTop = maxScrollTop;
    }
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Get current PDF pages
        const currentPages = await retrievePdfPages();
        if (!currentPages || currentPages.length === 0) {
          toast.error('No PDF pages found');
          return;
        }
        
        setIsAnalyzing(true);
        setMessages(prev => [...prev, { 
          text: 'در حال آنالیز PDF... لطفاً صبر کنید.',
          sender: 'ai'
        }]);
        
        // Detect PDF topic from first page
        const result = await retryApiCall(async () => {
          return await geminiModel.generateContent({
            contents: [{
              parts: [{
                text: `Please analyze this image and tell me what is the main topic or subject of this document/chapter? Return ONLY the topic name, nothing else.`,
              }, {
                inlineData: {
                  mimeType: "image/png",
                  data: currentPages[0].split(',')[1]
                }
              }]
            }]
          });
        });

        const detectedTopic = await result.response.text();
        setPdfTopic(detectedTopic.trim());

        // Create a new PDF with current pages
        const newPdfDoc = await PDFDocument.create();
        
        // Add each page as image
        for (const pageDataUrl of currentPages) {
          try {
            // Get mime type and base64 data
            const [mimeType, base64Data] = pageDataUrl.split(',');
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            // Check mime type and embed accordingly
            let image;
            if (mimeType.includes('image/png')) {
              image = await newPdfDoc.embedPng(imageBytes);
            } else if (mimeType.includes('image/jpeg')) {
              image = await newPdfDoc.embedJpg(imageBytes);
            } else {
              console.warn(`Unsupported image type: ${mimeType}`);
              continue;
            }
            
            // Add page with the image
            const page = newPdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
          } catch (error) {
            console.error('Error processing page:', error);
            continue;
          }
        }
        
        // Check if we have any pages
        if (newPdfDoc.getPageCount() === 0) {
          throw new Error('No pages could be processed');
        }
        
        pdfDocRef.current = newPdfDoc;
        totalPagesRef.current = newPdfDoc.getPageCount();
        
        console.log(`Starting analysis of ${totalPagesRef.current} pages...`);
        let fullAnalysis = '';
        
        // Process pages in groups of 5
        for (let groupStart = 0; groupStart < totalPagesRef.current; groupStart += 5) {
          try {
            // Calculate end of this group (not exceeding total pages)
            const groupEnd = Math.min(groupStart + 5, totalPagesRef.current);
            
            // Create a new document with this group of pages
            const groupPdfDoc = await PDFDocument.create();
            
            // Copy pages for this group
            const pageIndexes = Array.from(
              { length: groupEnd - groupStart }, 
              (_, i) => groupStart + i
            );
            
            const pages = await groupPdfDoc.copyPages(newPdfDoc, pageIndexes);
            pages.forEach(page => groupPdfDoc.addPage(page));
            
            // Convert to base64
            const pdfBytes = await groupPdfDoc.save();
            const base64String = btoa(
              new Uint8Array(pdfBytes)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            
            console.log(`Analyzing pages ${groupStart + 1}-${groupEnd}/${totalPagesRef.current}`);
            console.log('Group size:', Math.ceil(base64String.length / 1024), 'KB');
            
            // Add delay between groups to avoid rate limit
            if (groupStart > 0) {
              await sleep(2000);
            }
            
            // Send to Gemini with retry logic
            const result = await retryApiCall(async () => {
              return await geminiModel.generateContent({
                contents: [{
                  parts: [{
                    text: `Please analyze pages ${groupStart + 1} to ${groupEnd} of this PDF document. Remove any asterisks (*) from your response.`,
                  }, {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64String
                    }
                  }]
                }]
              });
            });

            const analysis = await result.response.text();
            const cleanAnalysis = analysis.replace(/\*/g, '');
            fullAnalysis += `\n\nPages ${groupStart + 1}-${groupEnd} Analysis:\n${cleanAnalysis}`;
            
            // Update progress
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                text: `در حال آنالیز PDF... صفحات ${groupStart + 1} تا ${groupEnd} از ${totalPagesRef.current} تمام شد.`,
                sender: 'ai'
              };
              return newMessages;
            });
            
          } catch (error) {
            console.error(`Error analyzing pages ${groupStart + 1}-${groupEnd}:`, error);
            fullAnalysis += `\n\nPages ${groupStart + 1}-${groupEnd}: Error analyzing these pages.`;
            
            // If we hit a hard error (not rate limit), wait longer before continuing
            await sleep(5000);
          }
        }
        
        // Store complete analysis
        chatRef.current = fullAnalysis;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            text: `آنالیز PDF تمام شد. همه ${totalPagesRef.current} صفحه آنالیز شدند. حالا می‌تونید سوال‌هاتون رو بپرسید.`,
            sender: 'ai'
          };
          return newMessages;
        });
        
        setIsAnalyzing(false);
        console.log('PDF analysis completed');
        
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat with PDF content');
        setIsAnalyzing(false);
      }
    };
    
    initChat();
  }, []);

  useEffect(() => {
    const loadPdfPages = async () => {
      const pdfPages = await retrievePdfPages();
      if (!pdfPages || pdfPages.length === 0) {
        toast.error('No PDF found');
        navigate('/');
        return;
      }
      pageRefs.current = new Array(pdfPages.length).fill(null);
      totalPagesRef.current = pdfPages.length;
    };

    loadPdfPages();
  }, [navigate]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    const currentMessage = message; // Store message before clearing
    setMessage(""); // Clear input immediately after sending
    
    try {
      await handleMessage(currentMessage);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error('خطا در ارسال پیام');
      setMessage(currentMessage); // Restore message if there was an error
    }
  };

  const handleNextPage = () => {
    if (!isAnalyzing) {
      const nextPage = currentPage + 1;
      if (nextPage < totalPagesRef.current) {
        // analyzePage(nextPage);
      } else {
        setMessages(prev => [...prev, { 
          text: 'همه صفحات PDF آنالیز شدند.',
          sender: 'ai'
        }]);
      }
    }
  };
  
  const handleMessage = async (message: string) => {
    if (isAnalyzing) {
      toast.error('لطفاً صبر کنید تا آنالیز PDF تمام شود.');
      return;
    }
    
    try {
      setMessages(prev => [...prev, { text: message, sender: 'user' }]);
      
      // Add user message to chat history
      chatHistoryRef.current.push(`User: ${message}`);
      
      // Build chat history context
      const chatHistory = chatHistoryRef.current.slice(-6).join('\n'); // Keep last 3 exchanges (6 messages)
      
      // Let AI check if the question is related to PDF content or chat history
      const topicCheckResult = await retryApiCall(async () => {
        return await geminiModel.generateContent({
          contents: [{
            parts: [{
              text: `PDF Topic: ${pdfTopic}
Chat History:
${chatHistory}

User Question: "${message}"

Is this question:
1. A greeting (like hello, hi, etc.)
2. Related to the PDF content about ${pdfTopic}
3. About the previous messages in chat history (like asking for translation, clarification, etc.)
4. Completely unrelated to both PDF and chat history

Return ONLY the number (1, 2, 3, or 4).`
            }]
          }]
        });
      });

      const questionType = parseInt(topicCheckResult.response.text().trim());
      
      // Handle different types of questions
      if (questionType === 1) {
        // Greeting - only respond with سلام if this is the first message
        if (messages.length <= 1) {
          setMessages(prev => [...prev, { 
            text: 'سلام! چه سوالی در مورد محتوای PDF دارید؟', 
            sender: 'ai' 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            text: 'چه سوالی در مورد محتوای PDF دارید؟', 
            sender: 'ai' 
          }]);
        }
        return true;
      } else if (questionType === 4) {
        // Unrelated question
        setMessages(prev => [...prev, { 
          text: `لطفاً سوال خود را در رابطه با محتوای PDF در مورد ${pdfTopic} مطرح کنید.`, 
          sender: 'ai' 
        }]);
        return true;
      }
      
      // If question is related to PDF or chat history, proceed with full response
      const result = await retryApiCall(async () => {
        return await geminiModel.generateContent({
          contents: [{
            parts: [{
              text: `Context from PDF analysis:\n${chatRef.current}\n\nChat History:\n${chatHistory}\n\nCurrent question: ${message}\n\nImportant Instructions:
1. ALWAYS respond in the SAME LANGUAGE as the user's question (if they ask in Persian/Farsi, respond in Persian/Farsi)
2. If the user asks about a previous question or answer, use the chat history above
3. Web Search Mode: ${isWebSearchEnabled ? 'ENABLED - YOU MUST INCLUDE WEB INFORMATION' : 'DISABLED - DO NOT USE WEB INFORMATION'}
   - When ENABLED: You MUST ALWAYS include both PDF content AND web knowledge. EVERY response must have at least one [web] citation
   - When DISABLED: Use ONLY the PDF content, NEVER include web information
4. Citation Format:
   - For PDF content: Add [p.X] after each piece of information
   - For web information: Add [web] at the end of sentences from web sources
5. ALWAYS validate your response:
   - If Web Search is ENABLED: Ensure you have included web information with [web] citations
   - If Web Search is DISABLED: Ensure you have NOT included any web information
6. NEVER start your response with سلام unless it's the very first message
7. Do not use any asterisks (*) in your response
8. ALWAYS use the word "PDF" instead of "سند" or "document" in your responses
9. When referring to the content, always say "محتوای PDF" or "این PDF" instead of "این سند"`
            }]
          }]
        });
      });

      const response = await result.response.text();
      const cleanResponse = response.replace(/\*/g, '');
      
      // Add AI response to chat history
      chatHistoryRef.current.push(`Assistant: ${cleanResponse}`);
      
      setMessages(prev => [...prev, { text: cleanResponse, sender: 'ai' }]);
      return true;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const retryApiCall = async (apiCall: () => Promise<any>, maxRetries = 3, delayMs = 2000): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        if (error?.message?.includes('429') && attempt < maxRetries) {
          console.log(`Rate limit hit, waiting ${delayMs/1000} seconds before retry ${attempt}/${maxRetries}...`);
          await sleep(delayMs);
          // Increase delay for next attempt
          delayMs *= 2;
          continue;
        }
        throw error;
      }
    }
  };

  const scrollToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pageRefs.current.length) return;
    
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center', 
        inline: 'center'
      });
    }
  }, []);

  const handlePageChange = (value: string) => {
    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageRefs.current.length) {
      setCurrentPage(pageNum);
      setTimeout(() => {
        scrollToPage(pageNum);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent p-2 sm:p-4 animate-fadeIn">
      <div className="max-w-[98%] mx-auto bg-white rounded-xl shadow-lg overflow-hidden h-[95vh]">
        <ResizablePanelGroup direction="horizontal" className="h-[95vh]">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <PDFZoomControls
                zoom={zoom}
                currentPage={currentPage}
                totalPages={totalPagesRef.current}
                inputPage={inputPage}
                onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
                onZoomOut={() => {
                  setZoom(prev => {
                    const newZoom = prev - 10;
                    return newZoom < 50 ? 50 : newZoom;
                  });
                }}
                onResetZoom={() => setZoom(100)}
                onPageInputChange={(e) => {
                  setInputPage(e.target.value);
                  const pageNum = parseInt(e.target.value);
                  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPagesRef.current) {
                    setCurrentPage(pageNum);
                    scrollToPage(pageNum);
                  }
                }}
                onPageChange={(newPage) => {
                  if (newPage >= 1 && newPage <= totalPagesRef.current) {
                    setCurrentPage(newPage);
                    scrollToPage(newPage);
                  }
                }}
              />
              <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
                <PDFViewerPanel
                  pageRefs={pageRefs}
                  zoom={zoom}
                  currentPage={currentPage}
                  ref={pdfViewerRef}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle>
            <GripVertical className="h-4 w-4" />
          </ResizableHandle>

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="sticky top-0 z-50 flex items-center justify-end p-2 border-b bg-gray-50">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-lg px-3 py-2 shadow-sm"
                >
                  <span className="font-medium">Back to PDF Manager</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Container */}
              <div className="flex flex-col h-full">
                {/* Messages Container with reverse column */}
                <div 
                  className="flex-1 overflow-y-auto"
                  ref={messagesContainerRef}
                  style={{ 
                    direction: 'ltr', 
                    backgroundColor: '#f8f8f9', 
                    paddingBottom: '20px',
                    maxHeight: 'calc(100vh - 200px)'
                  }}
                >
                  <div className="flex flex-col-reverse min-h-full">
                    <div className="space-y-4 p-4">
                      {messages.map((msg, index) => (
                        <ChatMessage 
                          key={index} 
                          message={msg}
                          onPageClick={(page) => {
                            setCurrentPage(page);
                            scrollToPage(page);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed Chat Input */}
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={(msg) => {
                    handleSendMessage(msg);
                    setMessage('');
                  }}
                  isWebSearchEnabled={isWebSearchEnabled}
                  setIsWebSearchEnabled={setIsWebSearchEnabled}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default PDFChat;