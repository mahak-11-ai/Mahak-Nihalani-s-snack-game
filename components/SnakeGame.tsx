import React, { useState, useEffect, useRef } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_SIZE,
  SNAKE_START,
  DIRECTIONS,
  MIN_SPEED,
  WIN_SCORE,
  MUSIC_URL,
  DIFFICULTY_SETTINGS,
  THEME_COLORS,
} from '../constants';
import type { Position, Difficulty, ThemeColors } from '../types';

// Helper function to generate new food, ensuring it's not on the snake's body
const createNewFood = (snake: Position[]): Position => {
  const gridSizeX = CANVAS_WIDTH / GRID_SIZE;
  const gridSizeY = CANVAS_HEIGHT / GRID_SIZE;
  let newFoodPosition: Position;

  while (true) {
    newFoodPosition = {
      x: Math.floor(Math.random() * gridSizeX),
      y: Math.floor(Math.random() * gridSizeY),
    };
    if (!snake.some(s => s.x === newFoodPosition.x && s.y === newFoodPosition.y)) {
      return newFoodPosition;
    }
  }
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(SNAKE_START);
  const [food, setFood] = useState<Position>(createNewFood(SNAKE_START));
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [highScores, setHighScores] = useState<{ [key in Difficulty]: number }>({ Easy: 0, Medium: 0, Hard: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const directionRef = useRef<Position>(DIRECTIONS.ArrowRight);
  const speedRef = useRef<number>(DIFFICULTY_SETTINGS.Medium.INITIAL_SPEED);
  
  const theme = THEME_COLORS[difficulty];

  // Load high scores from localStorage on mount
  useEffect(() => {
    const storedHighScores = localStorage.getItem('snakeHighScores');
    if (storedHighScores) {
      setHighScores(JSON.parse(storedHighScores));
    }
  }, []);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setSnake(SNAKE_START);
    setFood(createNewFood(SNAKE_START));
    setScore(0);
    setIsGameOver(false);
    setIsGameWon(false);
    setIsPaused(false);
    directionRef.current = DIRECTIONS.ArrowRight;
    speedRef.current = DIFFICULTY_SETTINGS[selectedDifficulty].INITIAL_SPEED;
    setGameStarted(true);
    audioRef.current?.play().catch(e => console.error("Audio playback failed:", e));
  };

  const stopGame = () => {
    setGameStarted(false);
    audioRef.current?.pause();
    if (score > highScores[difficulty]) {
      const newHighScores = { ...highScores, [difficulty]: score };
      setHighScores(newHighScores);
      localStorage.setItem('snakeHighScores', JSON.stringify(newHighScores));
    }
  };

  const togglePause = () => {
    if (!gameStarted || isGameOver || isGameWon) return;
    setIsPaused(prev => {
      if (prev) audioRef.current?.play().catch(e => console.error("Audio playback failed:", e));
      else audioRef.current?.pause();
      return !prev;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'p') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (!gameStarted || isPaused) return;
      const newDirection = DIRECTIONS[e.key];
      if (!newDirection) return;
      const { x, y } = directionRef.current;
      if ((newDirection.x !== 0 && newDirection.x === -x) || (newDirection.y !== 0 && newDirection.y === -y)) return;
      directionRef.current = newDirection;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isPaused]);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (!gameStarted || isPaused || isGameOver || isGameWon) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      if (currentTime - lastUpdateTimeRef.current > speedRef.current) {
        lastUpdateTimeRef.current = currentTime;
        setSnake(prevSnake => {
          const newSnake = [...prevSnake];
          const head = { ...newSnake[0] };
          const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };
          
          if (newHead.x >= CANVAS_WIDTH / GRID_SIZE || newHead.x < 0 || newHead.y >= CANVAS_HEIGHT / GRID_SIZE || newHead.y < 0 || newSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            setIsGameOver(true);
            stopGame();
            return prevSnake;
          }

          newSnake.unshift(newHead);

          if (newHead.x === food.x && newHead.y === food.y) {
            setScore(prevScore => {
              const newScore = prevScore + 1;
              if (newScore === WIN_SCORE) {
                setIsGameWon(true);
                stopGame();
              }
              if (newScore > 0 && newScore % 5 === 0) {
                speedRef.current = Math.max(MIN_SPEED, speedRef.current - DIFFICULTY_SETTINGS[difficulty].SPEED_INCREMENT);
              }
              return newScore;
            });
            setFood(createNewFood(newSnake));
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameStarted, isPaused, isGameOver, isGameWon, food, difficulty]);
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Draw background and grid
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = theme.grid;
    for (let i = GRID_SIZE; i < CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = GRID_SIZE; i < CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw food with gradient
    const foodGradient = ctx.createRadialGradient(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 4, food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2);
    foodGradient.addColorStop(0, 'white');
    foodGradient.addColorStop(1, theme.food);
    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw snake with gradient
    snake.forEach((segment, index) => {
      const segX = segment.x * GRID_SIZE;
      const segY = segment.y * GRID_SIZE;
      const gradient = ctx.createLinearGradient(segX, segY, segX + GRID_SIZE, segY + GRID_SIZE);
      if (index === 0) {
        gradient.addColorStop(0, theme.snakeHead);
        gradient.addColorStop(1, theme.snakeBody);
        ctx.fillStyle = gradient;
        ctx.fillRect(segX, segY, GRID_SIZE, GRID_SIZE);

        // Draw eyes
        ctx.fillStyle = 'black';
        const eyeSize = GRID_SIZE / 5;
        const dir = directionRef.current;
        if (dir.y === 0) { // Moving horizontally
            ctx.fillRect(segX + GRID_SIZE / 2, segY + GRID_SIZE / 4 - eyeSize / 2, eyeSize, eyeSize);
            ctx.fillRect(segX + GRID_SIZE / 2, segY + 3 * GRID_SIZE / 4 - eyeSize / 2, eyeSize, eyeSize);
        } else { // Moving vertically
            ctx.fillRect(segX + GRID_SIZE / 4 - eyeSize/2, segY + GRID_SIZE/2, eyeSize, eyeSize);
            ctx.fillRect(segX + 3 * GRID_SIZE / 4 - eyeSize/2, segY + GRID_SIZE/2, eyeSize, eyeSize);
        }
      } else {
        gradient.addColorStop(0, theme.snakeBody);
        gradient.addColorStop(1, theme.snakeHead);
        ctx.fillStyle = gradient;
        ctx.fillRect(segX, segY, GRID_SIZE, GRID_SIZE);
      }
    });

    // Draw UI Text
    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.textAlign = 'right';
    ctx.fillText(`High Score: ${highScores[difficulty]}`, CANVAS_WIDTH - 10, 25);
    
    // Draw overlays
    if (isGameOver || isGameWon || isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        if (isGameWon) {
          ctx.fillStyle = theme.snakeHead;
          ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        } else if(isGameOver) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        } else if (isPaused) {
          ctx.fillStyle = 'white';
          ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
        
        if (isGameOver || isGameWon) {
          ctx.fillStyle = 'white';
          ctx.font = '18px "Press Start 2P", monospace';
          ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        }
    }
  }, [snake, food, score, isGameOver, isGameWon, isPaused, difficulty, highScores, theme]);

  const buttonClass = `px-6 py-3 text-gray-900 font-bold text-lg rounded-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4`;

  if (!gameStarted && !isGameOver && !isGameWon) {
    return (
      <div className="flex flex-col items-center p-8 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-2xl text-white mb-6" style={{ fontFamily: '"Press Start 2P", cursive' }}>Select Difficulty</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={() => startGame('Easy')} className={`${buttonClass} ${THEME_COLORS.Easy.primary} ${THEME_COLORS.Easy.primaryHover} ${THEME_COLORS.Easy.primaryRing}`}>Easy</button>
          <button onClick={() => startGame('Medium')} className={`${buttonClass} ${THEME_COLORS.Medium.primary} ${THEME_COLORS.Medium.primaryHover} ${THEME_COLORS.Medium.primaryRing}`}>Medium</button>
          <button onClick={() => startGame('Hard')} className={`${buttonClass} ${THEME_COLORS.Hard.primary} ${THEME_COLORS.Hard.primaryHover} ${THEME_COLORS.Hard.primaryRing}`}>Hard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative border-4 border-gray-600 rounded-md shadow-lg ${theme.shadow}`} style={{ borderColor: theme.snakeHead }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
       <audio ref={audioRef} src={MUSIC_URL} loop />
       <div className="mt-6 flex gap-4">
          <button onClick={() => { setGameStarted(false); setIsGameOver(false); setIsGameWon(false); }} className={`${buttonClass} bg-gray-500 hover:bg-gray-400 focus:ring-gray-300`}>Main Menu</button>
          <button onClick={togglePause} className={`${buttonClass} ${theme.primary} ${theme.primaryHover} ${theme.primaryRing}`}>{isPaused ? 'Resume' : 'Pause'}</button>
       </div>
    </div>
  );
};

export default SnakeGame;
