import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/pdf/ChatMessage";
import { ChatInput } from "@/components/pdf/ChatInput";
import { useEffect, useRef } from "react";

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface PDFChatPanelProps {
  messages: Message[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export const PDFChatPanel = ({
  messages,
  message,
  setMessage,
  handleSendMessage,
}: PDFChatPanelProps) => {
  // مرجع برای اسکرول خودکار به پایین
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // هر بار که آرایه‌ی پیام‌ها تغییر کند، چت به انتهای لیست اسکرول می‌شود
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      {/* با ScrollArea می‌توانیم اسکرول دستی داشته باشیم */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 flex flex-col">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {/* المانی که با اسکرول IntoView می‌کنیم */}
          <div ref={messagesEndRef} />
        </div>
        {/* اسکرول بار سفارشی */}
        <ScrollBar />
      </ScrollArea>

      {/* ورودی چت در انتهای پنل */}
      <div className="border-t p-2">
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
