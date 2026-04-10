import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-game-dark flex items-center justify-center">
      <div className="text-white text-xl">Загрузка...</div>
    </div>
  );
};