'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { products, communityLinks } from '../_data';
import { actionsFromParts, productFromParts } from '../_chat-actions';
import { chooseInterest } from './interest';

// How much of the conversation goes to the model on each request. Without a
// cap, every turn resends the whole history and the payload grows without
// bound. The system prompt lives server-side, so this only trims the dialogue.
const HISTORY_LIMIT = 12;

// Don't let someone queue an unbounded backlog while a reply is streaming.
const QUEUE_LIMIT = 5;

// What the visitor can do from a reply. The ids come from the model via the
// suggestActions tool; these handlers are what actually make them work.
function runAction(action: { id: string; product?: string }) {
  const go = (id: string) => {
    const target = document.getElementById(id);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  switch (action.id) {
    case 'view_collection':
      go('collection');
      return true;
    case 'find_ritual':
      go('finder');
      return true;
    case 'see_ingredients':
      go('ingredients');
      return true;
    case 'read_faqs':
      go('faq');
      return true;
    case 'join_list':
      go('join');
      window.setTimeout(() => document.getElementById('join-email')?.focus({ preventScroll: true }), 600);
      return true;
    case 'notify_product': {
      // Pre-selects that product's interest in the signup form and scrolls to it.
      const match = products.find((p) => p.name === action.product);
      if (match) {
        chooseInterest(match.interest, match.name);
        return true;
      }
      go('collection');
      return true;
    }
    case 'message_whatsapp':
      window.open(communityLinks.messageUs, '_blank', 'noopener,noreferrer');
      return true;
    default:
      return false;
  }
}

type ActionChip = { id: string; label: string; product?: string };

const OPENERS = [
  'What do you make?',
  'Which one should I start with?',
  'What’s inside?',
];

export default function FabChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  // Messages typed while a reply is still streaming wait here, then go out one
  // at a time. This keeps requests serialized: the API never receives two
  // overlapping turns, and never the full history in one shot. The queue lives
  // in a ref so the drain logic can't read a stale copy; the state mirror exists
  // only so queued messages can be shown to the visitor.
  const queueRef = useRef<string[]>([]);
  const [queued, setQueued] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevStatus = useRef<string>('ready');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ body, ...rest }) => ({
          ...rest,
          body: { ...body, messages: (rest.messages ?? []).slice(-HISTORY_LIMIT) },
        }),
      }),
    []
  );

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    transport,
    onError: () => {
      // A failed turn shouldn't leave a retry storm queued up behind it.
      queueRef.current = [];
      setQueued([]);
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

  const pushQueue = (text: string) => {
    if (queueRef.current.length >= QUEUE_LIMIT) return false;
    queueRef.current = [...queueRef.current, text];
    setQueued(queueRef.current);
    return true;
  };

  const shiftQueue = () => {
    const [next, ...rest] = queueRef.current;
    queueRef.current = rest;
    setQueued(rest);
    return next;
  };

  const dropQueue = () => {
    queueRef.current = [];
    setQueued([]);
  };

  // Release exactly one queued message each time a reply finishes, so two turns
  // are never in flight at once.
  useEffect(() => {
    const becameReady = prevStatus.current !== 'ready' && status === 'ready';
    prevStatus.current = status;
    if (!becameReady || error) return;
    const next = shiftQueue();
    if (next) sendMessage({ text: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, error, sendMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (status === 'ready') {
      setInput('');
      sendMessage({ text });
      return;
    }
    // Mid-reply: hold it in line rather than firing a second request.
    if (pushQueue(text)) setInput('');
  };

  const ask = (text: string) => {
    if (status === 'ready') sendMessage({ text });
    else pushQueue(text);
  };

  const handleAction = (action: ActionChip) => {
    const worked = runAction(action);
    // Getting out of the way so they can see where we sent them.
    if (worked) setIsOpen(false);
  };

  const clearChat = () => {
    dropQueue();
    setMessages([]);
  };

  const busy = status === 'streaming' || status === 'submitted';

  return (
    <>
      <button
        className={`fab-chat ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Chat with Gourmet Glow'}
        aria-expanded={isOpen}
        type="button"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <Image src="/logo.png" alt="" width={40} height={46} className="fab-chat-logo" priority />
        )}
        {!isOpen && <span className="fab-chat-dot" aria-hidden="true" />}
      </button>

      <div className={`chat-panel glass glass-dark ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <Image src="/logo.png" alt="" width={40} height={46} />
            </div>
            <div>
              <h3>Gourmet Glow</h3>
              <p className="chat-status">
                {busy ? 'typing…' : <><span className="chat-online" aria-hidden="true" />Usually replies in a few minutes</>}
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button onClick={clearChat} className="chat-clear-btn" aria-label="Start over">
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
              <div className="chat-welcome-icon">
                <Image src="/logo.png" alt="" width={34} height={39} />
              </div>
              <h4>Hi, welcome to Gourmet Glow</h4>
              <p>Ask us anything about our products, what goes into them, or when we launch.</p>
              <div className="chat-openers">
                {OPENERS.map((o) => (
                  <button key={o} type="button" className="chat-opener" onClick={() => ask(o)} disabled={status !== 'ready'}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => {
            const chips = message.role === 'assistant' ? actionsFromParts(message.parts) : [];
            const product = message.role === 'assistant' ? productFromParts(message.parts) : null;
            return (
              <div key={message.id} className={`chat-message chat-message-${message.role}`}>
                <div className="chat-bubble">
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <div key={index} className="chat-text">
                        {part.text}
                      </div>
                    ) : null
                  )}

                  {product && (
                    <div className="chat-product">
                      <b>{product.name}</b>
                      <span>{product.tagline}</span>
                      {product.ingredients?.length ? <em>{product.ingredients.join(' · ')}</em> : null}
                    </div>
                  )}

                  {chips.length > 0 && (
                    <div className="chat-actions">
                      {chips.map((action) => (
                        <button key={action.id} type="button" className="chat-action" onClick={() => handleAction(action)}>
                          {action.label}
                          <span aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          {queued.map((text, i) => (
            <div key={`queued-${i}`} className="chat-message chat-message-user chat-message-queued">
              <div className="chat-bubble">
                <div className="chat-text">{text}</div>
                <span className="chat-queued-note">Sending next…</span>
              </div>
            </div>
          ))}
          {error && (
            <div className="chat-error">
              <p>Sorry, we couldn’t reach the team just now. Please try again in a moment.</p>
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
              placeholder={busy ? 'Type ahead — we’ll answer next…' : 'Ask us anything…'}
              className="chat-input"
              aria-label="Your message"
            />
            {busy && !input.trim() ? (
              <button type="button" onClick={stop} className="chat-send-btn chat-stop-btn" aria-label="Stop">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="chat-send-btn"
                aria-label={busy ? 'Queue message' : 'Send message'}
              >
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
