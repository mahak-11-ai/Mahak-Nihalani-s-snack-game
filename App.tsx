import React from 'react';
import SnakeGame from './components/SnakeGame';

const App: React.FC = () => {
  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center text-white font-mono p-4">
      <header className="mb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-300 tracking-widest" style={{ fontFamily: '"Press Start 2P", cursive' }}>
          SNAKE
        </h1>
        <p className="text-gray-400">Select a difficulty to begin</p>
      </header>
      <main>
        <SnakeGame />
      </main>
      <footer className="mt-6 text-center text-gray-500 text-sm">
        <p>Enhanced by a world-class senior frontend React engineer.</p>
        <p>Music: "The Future Is Now" by SergeQuadrado from Pixabay.</p>
      </footer>
    </div>
  );
};

export default App;
