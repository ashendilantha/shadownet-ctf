'use client';

import { useEffect, useState } from 'react';
import OperativeArtwork from '@/components/OperativeArtwork';

const lines = [
  'Hey, hacker. Ready to make NexaCorp regret underestimating you?',
  'Take your time. Good operators follow the evidence, not the noise.',
  'NexaCorp calls missing safety reports "administrative delays." Convenient.',
  'You have got this. Stay curious, test your assumptions, and keep moving.',
  'Funny how NexaCorp can afford a new lobby but not an honest audit.',
  'One careful step at a time. Their security theater is not as solid as it looks.',
];

export default function FieldCompanion() {
  const [hasStarted, setHasStarted] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const openingTimer = window.setTimeout(() => setHasStarted(true), 2000);
    return () => window.clearTimeout(openingTimer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const dialogueTimer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % lines.length);
    }, 12000);

    return () => window.clearInterval(dialogueTimer);
  }, [hasStarted]);

  return (
    <div className="challenge-operative-dock">
      {hasStarted && (
        <div className="challenge-companion-intro" role="status" aria-live="polite">
          <span className="font-mono text-[9px] font-bold text-[#9FEF00]">SHADE // PRIVATE CHANNEL</span>
          <p key={lineIndex} className="companion-line animate-fade-in">
            {lines[lineIndex]}
          </p>
        </div>
      )}

      <div className="challenge-companion-art" aria-hidden="true">
        <OperativeArtwork
          sizes="(max-width: 640px) 72px, 88px"
          className="challenge-figure h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}