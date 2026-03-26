import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FFFF] font-mono flex flex-col items-center justify-center p-4 relative">
      <div className="static-overlay"></div>
      <div className="scanline"></div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        
        <header className="w-full flex justify-between items-end px-4 border-b-4 border-[#FF00FF] pb-4 screen-tear">
          <div>
            <h1 className="text-5xl md:text-7xl glitch-text text-[#00FFFF]" data-text="SNAKE.EXE">
              SNAKE.EXE
            </h1>
            <p className="text-[#FF00FF] text-xl mt-2">
              &gt; INITIALIZING NEURAL LINK...
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[#00FFFF] text-xl mb-1">DATA_COLLECTED</p>
            <div className="text-4xl md:text-5xl text-[#FF00FF] glitch-text" data-text={score.toString().padStart(4, '0')}>
              {score.toString().padStart(4, '0')}
            </div>
          </div>
        </header>

        <main className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12 w-full">
          
          <div className="flex-shrink-0 relative">
            <SnakeGame onScoreChange={setScore} />
            <div className="mt-4 text-center text-[#00FFFF] text-lg border border-[#00FFFF] p-2 bg-[#00FFFF]/10">
              INPUT: [W,A,S,D] OR [ARROWS] | INTERRUPT: [SPACE]
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <MusicPlayer />
            
            <div className="mt-8 border-2 border-[#00FFFF] p-4 bg-[#050505]">
              <h3 className="text-[#FF00FF] text-xl mb-2 border-b border-[#FF00FF] pb-1">SYSTEM_LOG</h3>
              <ul className="text-[#00FFFF] text-sm space-y-1 opacity-80">
                <li>&gt; BOOT SEQUENCE INITIATED</li>
                <li>&gt; LOADING GRAPHICS... OK</li>
                <li>&gt; AUDIO SUBSYSTEM... ONLINE</li>
                <li>&gt; AWAITING USER INPUT...</li>
              </ul>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
