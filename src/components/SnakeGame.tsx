import { useEffect, useRef, useState, useCallback } from 'react';

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

const GRID_SIZE = 20;
const GAME_SPEED = 100; // ms per move

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'PLAYING' | 'PAUSED' | 'GAME_OVER'>('PLAYING');
  const [score, setScore] = useState(0);

  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    direction: { x: 0, y: -1 },
    nextDirection: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    lastMoveTime: 0,
    particles: [] as Particle[],
    shake: 0,
    status: 'PLAYING'
  });

  const generateFood = (snake: Point[]) => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = snake.some((s) => s.x === newFood.x && s.y === newFood.y);
    }
    return newFood!;
  };

  const resetGame = useCallback(() => {
    state.current = {
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      lastMoveTime: performance.now(),
      particles: [],
      shake: 0,
      status: 'PLAYING'
    };
    setScore(0);
    onScoreChange(0);
    setStatus('PLAYING');
  }, [onScoreChange]);

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      state.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        maxLife: 1 + Math.random() * 0.5,
        color
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { nextDirection, direction, status: currentStatus } = state.current;
      
      if (currentStatus === 'GAME_OVER') {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (direction.y !== 1) state.current.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (direction.y !== -1) state.current.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (direction.x !== 1) state.current.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (direction.x !== -1) state.current.nextDirection = { x: 1, y: 0 };
          break;
        case ' ':
        case 'Escape':
          e.preventDefault();
          if (currentStatus === 'PLAYING') {
            state.current.status = 'PAUSED';
            setStatus('PAUSED');
          } else if (currentStatus === 'PAUSED') {
            state.current.status = 'PLAYING';
            setStatus('PLAYING');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      const deltaTime = time - lastTime;
      lastTime = time;

      const s = state.current;

      // Update game logic
      if (s.status === 'PLAYING') {
        if (time - s.lastMoveTime > GAME_SPEED) {
          s.lastMoveTime = time;
          s.direction = s.nextDirection;

          const head = s.snake[0];
          const newHead = { x: head.x + s.direction.x, y: head.y + s.direction.y };

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            s.status = 'GAME_OVER';
            setStatus('GAME_OVER');
            s.shake = 20;
            spawnParticles(head.x, head.y, '#00FFFF');
          } 
          // Self collision
          else if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            s.status = 'GAME_OVER';
            setStatus('GAME_OVER');
            s.shake = 20;
            spawnParticles(head.x, head.y, '#00FFFF');
          } 
          else {
            s.snake.unshift(newHead);
            
            // Food collision
            if (newHead.x === s.food.x && newHead.y === s.food.y) {
              const newScore = score + 10;
              setScore(newScore);
              onScoreChange(newScore);
              s.food = generateFood(s.snake);
              s.shake = 5;
              spawnParticles(newHead.x, newHead.y, '#FF00FF');
            } else {
              s.snake.pop();
            }
          }
        }
      }

      // Update particles
      s.particles.forEach(p => {
        p.x += p.vx * deltaTime * 0.05;
        p.y += p.vy * deltaTime * 0.05;
        p.life -= deltaTime * 0.002;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      // Update shake
      if (s.shake > 0) {
        s.shake *= 0.9;
        if (s.shake < 0.5) s.shake = 0;
      }

      // Draw
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      if (s.shake > 0) {
        const dx = (Math.random() - 0.5) * s.shake;
        const dy = (Math.random() - 0.5) * s.shake;
        ctx.translate(dx, dy);
      }

      // Grid lines (faint)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#FF00FF';
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 15;
      ctx.fillRect(s.food.x * cellSize + 2, s.food.y * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.shadowBlur = 0;

      // Draw Snake
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#FFFFFF' : '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = i === 0 ? 15 : 5;
        ctx.fillRect(seg.x * cellSize + 1, seg.y * cellSize + 1, cellSize - 2, cellSize - 2);
      });
      ctx.shadowBlur = 0;

      // Draw Particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x * cellSize + cellSize/2, p.y * cellSize + cellSize/2, 4, 4);
      });
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [score, onScoreChange]);

  return (
    <div className="relative border-4 border-[#00FFFF] bg-[#050505] p-2 screen-tear">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full max-w-[400px] aspect-square block bg-black"
      />

      {status === 'GAME_OVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-sm">
          <h2 className="text-5xl text-[#FF00FF] glitch-text mb-4" data-text="FATAL_ERROR">FATAL_ERROR</h2>
          <p className="text-[#00FFFF] text-2xl mb-8">SCORE: {score}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-[#050505] transition-colors text-2xl"
          >
            REBOOT_SYS
          </button>
        </div>
      )}

      {status === 'PAUSED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm">
          <h2 className="text-5xl text-[#00FFFF] glitch-text" data-text="SYS_PAUSED">SYS_PAUSED</h2>
        </div>
      )}
    </div>
  );
}
