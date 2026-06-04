import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({ 
  phrases, 
  typingSpeed = 60, 
  deletingSpeed = 30, 
  delayBetween = 2000 
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    let timer: any;

    if (!isDeleting && displayedText === currentPhrase) {
      // Pause at the end of typing before deleting
      timer = setTimeout(() => setIsDeleting(true), delayBetween);
    } else if (isDeleting && displayedText === '') {
      // Move to the next phrase once fully deleted
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      // Step character additions or subtractions
      const nextText = isDeleting 
        ? currentPhrase.substring(0, displayedText.length - 1)
        : currentPhrase.substring(0, displayedText.length + 1);

      timer = setTimeout(() => {
        setDisplayedText(nextText);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, delayBetween]);

  return (
    <span className="relative">
      {displayedText}
      <span className="absolute ml-1 inline-block w-[3px] h-[85%] bg-sky-400 bottom-1 animate-[pulse_0.8s_infinite]" />
    </span>
  );
};