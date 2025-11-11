import type { Position, Difficulty, ThemeColors } from './types';

// Canvas and grid dimensions
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 400;
export const GRID_SIZE = 20;

// Initial game state
export const SNAKE_START: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
];
export const FOOD_START: Position = { x: 15, y: 15 };

// Game controls
export const DIRECTIONS: { [key: string]: Position } = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

// Gameplay settings
export const MIN_SPEED = 50; // Fastest speed
export const WIN_SCORE = 20;

export const DIFFICULTY_SETTINGS: {
  [key in Difficulty]: {
    INITIAL_SPEED: number;
    SPEED_INCREMENT: number;
  };
} = {
  Easy: { INITIAL_SPEED: 200, SPEED_INCREMENT: 5 },
  Medium: { INITIAL_SPEED: 150, SPEED_INCREMENT: 10 },
  Hard: { INITIAL_SPEED: 100, SPEED_INCREMENT: 15 },
};

export const THEME_COLORS: {
  [key in Difficulty]: ThemeColors;
} = {
  Easy: {
    primary: 'bg-green-500',
    primaryHover: 'hover:bg-green-400',
    primaryRing: 'focus:ring-green-300',
    shadow: 'shadow-green-500/20',
    snakeHead: '#4ade80',
    snakeBody: '#86efac',
    food: '#facc15',
    background: '#1f2937',
    grid: 'rgba(156, 163, 175, 0.1)',
  },
  Medium: {
    primary: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-400',
    primaryRing: 'focus:ring-blue-300',
    shadow: 'shadow-blue-500/20',
    snakeHead: '#60a5fa',
    snakeBody: '#93c5fd',
    food: '#f97316',
    background: '#1e293b',
    grid: 'rgba(156, 163, 175, 0.15)',
  },
  Hard: {
    primary: 'bg-red-500',
    primaryHover: 'hover:bg-red-400',
    primaryRing: 'focus:ring-red-300',
    shadow: 'shadow-red-500/20',
    snakeHead: '#f87171',
    snakeBody: '#fca5a5',
    food: '#a855f7',
    background: '#171717',
    grid: 'rgba(163, 163, 163, 0.2)',
  },
};


// Assets
export const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/10/26/audio_db327a39e8.mp3";
