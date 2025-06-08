'use client';

import { useEffect, useRef, useState } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

type BackgroundAudioProps = {
  src: string;
  volume?: number;
};

export default function BackgroundAudio({ src, volume = 0.2 }: BackgroundAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    function playAudio() {
      if (!hasPlayed && audioRef.current) {
        audioRef.current.play().catch(() => {
          // play failed, maybe due to browser policy
        });
        setHasPlayed(true);
        window.removeEventListener('click', playAudio);
        window.removeEventListener('touchstart', playAudio);
      }
    }

    // Attach event listeners for user interaction to start audio
    window.addEventListener('click', playAudio);
    window.addEventListener('touchstart', playAudio);

    // Cleanup
    return () => {
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };
  }, [hasPlayed]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsMuted(!isMuted);
    audio.volume = isMuted ? volume : 0;
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src={src} type="audio/mpeg" />
      </audio>
      <button
        onClick={toggleMute}
        className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition"
      >
        {isMuted ? (
          <SpeakerXMarkIcon className="h-5 w-5 text-white" />
        ) : (
          <SpeakerWaveIcon className="h-5 w-5 text-white" />
        )}
      </button>
    </>
  );
}
