import { useEffect, useState, useRef } from 'react';

interface AudioPlayerProps {
  base64Audio: string | null;
  onFinished?: () => void;
}

export function AudioPlayer({ base64Audio, onFinished }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (base64Audio) {
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Playback failed:", err));
      }
    }
  }, [base64Audio]);

  const handleEnded = () => {
    setIsPlaying(false);
    if (onFinished) onFinished();
  };

  if (!isPlaying && !base64Audio) return null;

  return (
    <div className="flex items-center gap-1 h-6">
      <audio ref={audioRef} onEnded={handleEnded} className="hidden" />

      {/* Visual Waveform */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${isPlaying ? 'bg-indigo-400 animate-waveform' : 'bg-white/10 h-1'
            }`}
          style={{
            animationDelay: `${i * 0.05}s`,
            height: isPlaying ? '100%' : '4px'
          }}
        />
      ))}
    </div>
  );
}