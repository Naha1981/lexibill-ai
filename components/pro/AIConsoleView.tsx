
import React, { useState, useRef, useEffect } from 'react';
import { AIConsoleMessage } from '../../types';
import { SendIcon, SpinnerIcon, UserIcon, RobotIcon, CopyIcon } from '../icons';

interface AIConsoleViewProps {
  messages: AIConsoleMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
}

const AIConsoleView: React.FC<AIConsoleViewProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (inputQuery.trim()) {
      onSendMessage(inputQuery.trim());
      setInputQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert("Failed to copy.");
    });
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#17352b] rounded-lg border border-[#2f6a55]">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto chat-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.type === 'user' ? 'bg-[#017a50] text-white rounded-br-none' : 
              msg.type === 'bot' ? 'bg-[#214a3c] text-[#b2dfdb] rounded-bl-none' : 
              'bg-red-800/70 text-red-100 rounded-bl-none'
            }`}>
              <div className="flex items-start text-xs mb-1 opacity-80">
                {msg.type === 'user' && <UserIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />}
                {msg.type === 'bot' && <RobotIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />}
                {msg.type === 'error' && <RobotIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />}
                <span className="font-medium">
                    {msg.type === 'user' ? 'You' : msg.type === 'bot' ? 'LexiBill AI' : 'LexiBill AI Error'}
                </span>
                <span className="ml-2 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans">{msg.text}</pre>
              { (msg.type === 'bot' || msg.type === 'error') && msg.text && (
                <button 
                    onClick={() => copyToClipboard(msg.text)} 
                    title="Copy response"
                    className="mt-1.5 -mb-1 -mr-1 p-1 text-[#8ecdb7] hover:text-white opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Copy AI response"
                >
                    <CopyIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-[#2f6a55] bg-[#17352b] rounded-b-lg">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask LexiBill anything about your billing data... (e.g., 'list all clients')"
            className="flex-grow p-2.5 bg-[#214a3c] text-white rounded-lg border border-[#2f6a55] focus:ring-2 focus:ring-[#019863] focus:outline-none resize-none text-sm placeholder:text-[#8ecdb7]"
            rows={1}
            style={{ maxHeight: '80px', overflowY: 'auto' }}
            disabled={isLoading}
            aria-label="Type your query for LexiBill AI"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 bg-[#019863] text-white rounded-lg hover:bg-[#017a50] disabled:opacity-50 flex items-center justify-center h-[42px] w-[42px]"
            aria-label="Send query"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-[#8ecdb7] mt-1.5 text-center">
            AI responses are based on your local data and current system capabilities. Complex queries are experimental.
        </p>
      </div>
    </div>
  );
};

export default AIConsoleView;
