import React from 'react';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon } from './icons'; // Re-adding for styled avatars

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="my-2 px-4 text-center text-xs text-[#8ecdb7] opacity-80">
        {message.text}
      </div>
    );
  }

  const Avatar: React.FC<{isUser: boolean}> = ({ isUser }) => (
    <div className={`rounded-full w-10 h-10 shrink-0 flex items-center justify-center ${isUser ? 'bg-[#004d40]' : 'bg-[#00796b]'}`}>
      {isUser ? <UserIcon className="h-6 w-6 text-white" /> : <BotIcon className="h-6 w-6 text-white" />}
    </div>
  );
  
  // Common prose styles for HTML content
  const proseClasses = "prose prose-sm max-w-none prose-p:text-white prose-li:text-white prose-strong:text-white prose-headings:text-white prose-ul:list-disc prose-ul:pl-5";


  return (
    <div className={`flex items-end gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Avatar isUser={false} />}
      <div className="flex flex-1 flex-col gap-1 items-start max-w-[calc(100%-52px-0.75rem)]"> {/* 52px for avatar + gap */}
        <p className={`text-[#8ecdb7] text-[13px] font-normal leading-normal ${isUser ? 'self-end' : 'self-start'}`}>
          {isUser ? 'You' : 'AI Assistant'}
        </p>
        <div
          className={`text-base font-normal leading-normal flex w-fit max-w-full rounded-xl px-4 py-3 break-words ${
            isUser 
              ? 'bg-[#019863] text-white self-end' 
              : 'bg-[#214a3c] text-white self-start'
          }`}
        >
          {message.isHtml ? (
             <div dangerouslySetInnerHTML={{ __html: message.text }} className={proseClasses} />
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
      </div>
      {isUser && <Avatar isUser={true} />}
    </div>
  );
};

export default MessageBubble;
