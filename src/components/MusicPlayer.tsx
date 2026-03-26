import { useState, useEffect, useRef, useCallback } from 'react';

const TRACKS = [
  { id: 1, title: 'SYS.AUDIO.01', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'SYS.AUDIO.02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'SYS.AUDIO.03', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="w-full border-4 border-[#FF00FF] bg-[#050505] p-4 relative overflow-hidden screen-tear font-mono">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFFF] opacity-50 animate-pulse"></div>
      <audio ref={audioRef} src={currentTrack.url} onEnded={playNext} />
      
      <div className="mb-4 border-b-2 border-[#00FFFF] pb-2">
        <h3 className="text-[#FF00FF] text-2xl glitch-text" data-text="AUDIO_SUBSYSTEM">AUDIO_SUBSYSTEM</h3>
        <div className="text-[#00FFFF] text-3xl mt-2 flex justify-between">
          <span>TRACK:</span>
          <span className="animate-pulse">{currentTrack.title}</span>
        </div>
        <div className="text-[#00FFFF] text-xl mt-1 flex justify-between opacity-70">
          <span>STATUS:</span>
          <span>{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-4xl mt-6">
        <button onClick={playPrev} className="hover:text-[#FF00FF] hover:bg-[#00FFFF]/20 px-2 border border-transparent hover:border-[#FF00FF] transition-all">
          [PREV]
        </button>
        <button onClick={togglePlay} className="text-[#FF00FF] hover:text-[#00FFFF] hover:bg-[#FF00FF]/20 px-4 py-1 border-2 border-[#FF00FF] hover:border-[#00FFFF] transition-all glitch-text" data-text={isPlaying ? 'HALT' : 'EXEC'}>
          {isPlaying ? 'HALT' : 'EXEC'}
        </button>
        <button onClick={playNext} className="hover:text-[#FF00FF] hover:bg-[#00FFFF]/20 px-2 border border-transparent hover:border-[#FF00FF] transition-all">
          [NEXT]
        </button>
      </div>
    </div>
  );
}
