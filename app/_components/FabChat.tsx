'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useState, useEffect, useRef } from 'react';

export default function FabChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: () => {
      // Error handled by UI display
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      <button
        className={`fab-chat ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        aria-expanded={isOpen}
        type="button"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        )}
        <span className="fab-chat-badge">AI</span>
      </button>

      <div className={`chat-panel glass glass-dark ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <span>GG</span>
            </div>
            <div>
              <h3>Gourmet Glow AI</h3>
              <p className="chat-status">{status === 'streaming' ? 'Typing...' : 'Ask about our products'}</p>
            </div>
          </div>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button onClick={clearChat} className="chat-clear-btn" aria-label="Clear chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="chat-close-btn" aria-label="Close chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">✨</div>
              <h4>Welcome to Gourmet Glow</h4>
              <p>Ask me about our products, ingredients, launch date, or anything else!</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`chat-message chat-message-${message.role}`}>
              <div className="chat-bubble">
                {message.parts.map((part, index) =>
                  part.type === 'text' ? (
                    <div key={index} className="chat-text">
                      {part.text}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
          {status === 'submitted' && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-bubble chat-bubble-loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="chat-error">
              <p>Oops! Something went wrong. Please try again.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={status !== 'ready'}
              className="chat-input"
            />
            {(status === 'streaming' || status === 'submitted') ? (
              <button type="button" onClick={stop} className="chat-send-btn chat-stop-btn" aria-label="Stop generating">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                </svg>
              </button>
            ) : (
              <button type="submit" disabled={!input.trim() || status !== 'ready'} className="chat-send-btn" aria-label="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>

      {isOpen && <div className="chat-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
}