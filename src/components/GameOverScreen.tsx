import React from 'react';

export const GameOverScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-game-dark flex items-center justify-center">
      <div className="bg-black/80 text-white p-8 rounded-xl text-center">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-3xl font-bold mb-2">ИГРА ОКОНЧЕНА</h1>
        <p className="text-gray-400 mb-4">База разрушена...</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-500 transition"
        >
          Начать заново
        </button>
      </div>
    </div>
  );
};