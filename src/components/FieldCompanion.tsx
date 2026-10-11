'use client';

import { useEffect, useState } from 'react';
import OperativeArtwork from '@/components/OperativeArtwork';

const openingLine = 'Hey, hacker. Ready to make NexaCorp regret underestimating you?';

const responses = [
  {
    prompt: 'What did NexaCorp do?',
    reply: 'They called corner-cutting "efficiency" and buried every complaint they could. Real classy.',
  },
  {
    prompt: 'Got any advice?',
    reply: 'Take your time, follow the evidence, and trust what you can verify over corporate spin.',
  },
  {
    prompt: "I'm in. Let's do this.",
    reply: "That's the spirit. I'll be here while you make their day considerably worse.",
  },
];

interface DialogueMessage {
  speaker: 'shade' | 'you';
  text: string;
}

export default function FieldCompanion() {
  const [showOpening, setShowOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DialogueMessage[]>([
    { speaker: 'shade', text: openingLine },
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowOpening(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const chooseResponse = (prompt: string, reply: string) => {
    setMessages((current) => [
      ...current,
      { speaker: 'you', text: prompt },
      { speaker: 'shade', text: reply },
    ]);
  };

  return (
    <div className="challenge-operative-dock">
      {isOpen && (
        <section className="challenge-companion-chat" aria-label="Conversation with Shade">
          <header className="flex items-center justify-between border-b border-[#344052] pb-2">
            <div>
              <p className="font-mono text-[10px] font-bold text-[#9FEF00]">SHADE // PRIVATE CHANNEL</p>
              <p className="text-[10px] text-[#8B949E]">Signal encrypted</p>
            </div>
            <button
              type="button"
              className="companion-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close conversation"
            >
              ×
            </button>
          </header>

          <div className="companion-transcript" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <p
                key={`${index}-${message.speaker}`}
                className={`companion-message ${message.speaker === 'you' ? 'companion-message-you' : ''}`}
              >
                {message.text}
              </p>
            ))}
          </div>

          <div className="grid gap-1.5">
            {responses.map(({ prompt, reply }) => (
              <button
                key={prompt}
                type="button"
                className="companion-reply"
                onClick={() => chooseResponse(prompt, reply)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>
      )}

      {!isOpen && showOpening && (
        <div className="challenge-companion-intro animate-fade-in">
          <button type="button" onClick={() => setIsOpen(true)} className="text-left">
            {openingLine}
          </button>
          <button
            type="button"
            className="companion-close"
            onClick={() => setShowOpening(false)}
            aria-label="Dismiss Shade's message"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        className="challenge-companion-art"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close conversation with Shade' : 'Chat with Shade'}
        aria-expanded={isOpen}
        title="Chat with Shade"
      >
        <OperativeArtwork
          sizes="(max-width: 640px) 96px, 144px"
          className="challenge-figure h-auto w-full object-contain"
        />
      </button>
    </div>
  );
}