
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import { ArrowLeftIcon, MicrophoneIcon, SpinnerIcon, LexiBillLogoIcon } from './icons';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onNavigateHome: () => void; // New prop for navigation
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, onNavigateHome }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-10">
        <button 
          onClick={onNavigateHome} 
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors" 
          aria-label="Back to home"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center py-3">
          <LexiBillLogoIcon className="h-10 w-10 text-[#8ecdb7] mb-2" />
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            LexiBill AI
          </h1>
          <p className="text-[#8ecdb7] text-xs leading-tight mt-1">
            Clarity in Every Bill — Because Happy Clients Matter.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center" aria-hidden="true">
          {/* Invisible spacer to balance the left icon for centering */}
        </div>
      </header>

      {/* Animated Divider Line */}
      <div className="px-4 pt-1 pb-3 bg-[#10231c]">
        <div
          className="h-px bg-[#8ecdb7] animate-draw-line-lr"
          style={{ transformOrigin: 'left' }}
        ></div>
      </div>

      {/* Message Area */}
      <div className="flex-grow overflow-y-auto chat-scrollbar px-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.sender === 'user' && (
          <div className="flex items-end gap-3 p-4">
             <div className={`rounded-full w-10 h-10 shrink-0 flex items-center justify-center bg-[#00796b]`}>
                <LexiBillLogoIcon className="h-6 w-6 text-white" /> {/* Using logo icon for consistency */}
            </div>
            <div className="flex flex-1 flex-col gap-1 items-start">
              <p className="text-[#8ecdb7] text-[13px] font-normal leading-normal">AI Assistant</p>
              <div className="text-base font-normal leading-normal flex max-w-[360px] rounded-xl px-4 py-3 bg-[#214a3c] text-white">
                <SpinnerIcon className="h-5 w-5 text-[#8ecdb7]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#10231c] sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 gap-3">
          <label className="flex flex-col min-w-40 h-12 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message or command..."
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#214a3c] h-full placeholder:text-[#8ecdb7] px-4 text-base font-normal leading-normal"
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                type="submit"
                className="flex items-center justify-center px-3 bg-[#214a3c] rounded-r-xl text-[#8ecdb7] hover:text-white disabled:opacity-50 transition-colors"
                disabled={isLoading || !inputText.trim()}
                aria-label="Send message"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
          </label>
        </form>
        <div className="h-5 bg-[#10231c]"></div>
      </div>
    </>
  );
};

export default ChatInterface;
