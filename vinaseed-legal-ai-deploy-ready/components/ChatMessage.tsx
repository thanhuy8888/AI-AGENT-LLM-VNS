
import React, { useState } from 'react';
import { User, Sprout, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-900 font-bold">$1</strong>')
        .replace(/^\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^- (.*)/g, '<li class="ml-4 list-disc">$1</li>');
      
      return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} className="min-h-[1.25rem]" />;
    });
  };

  return (
    <div className={`flex w-full mb-8 message-appear ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 md:gap-4`}>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser ? 'bg-[#008d44] text-white' : 'bg-white border border-emerald-100 text-[#008d44]'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}>
          <div className={`relative p-4 md:p-5 rounded-2xl text-[14px] md:text-[15px] leading-[1.6] shadow-sm transition-all ${
            isUser 
              ? 'bg-[#008d44] text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-emerald-50 rounded-tl-none ring-1 ring-emerald-50 hover:shadow-md'
          }`}>
            <div className="space-y-1">
              {formatText(message.text)}
            </div>
            
            {!isUser && (
              <button 
                onClick={handleCopy}
                className="absolute -right-10 top-0 p-2 text-slate-300 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
                title="Sao chép câu trả lời"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-tighter">
              {isUser ? 'Cán bộ' : 'Trợ lý Vinaseed'}
            </span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] text-slate-300 font-medium">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
