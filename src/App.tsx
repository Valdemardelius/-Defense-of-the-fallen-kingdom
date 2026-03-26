import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  const [baseHp, setBaseHp] = useState(1000);
  const [resources, setResources] = useState(100);
  const [message, setMessage] = useState('');

  const handleBaseDamage = (damage: number) => {
    setBaseHp(prev => {
      const newHp = prev - damage;
      if (newHp <= 0) {
        setMessage('ИГРА ОКОНЧЕНА! Обнови страницу чтобы начать заново.');
      }
      return Math.max(0, newHp);
    });
  };

  const handleResourceGain = (amount: number) => {
    setResources(prev => prev + amount);
  };

  return (
    <div className="min-h-screen bg-game-dark flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-white text-center">
        <h1 className="text-2xl font-bold">Tower Defense: Wave Protector</h1>
        <div className="flex gap-8 mt-2 justify-center">
          <div>❤️ База: {Math.floor(baseHp)}/1000</div>
          <div>💰 Ресурсы: {resources}</div>
        </div>
        {message && (
          <div className="mt-2 text-red-500 font-bold animate-pulse">
            {message}
          </div>
        )}
      </div>
      
      <GameCanvas 
        width={800} 
        height={600}
        onBaseDamage={handleBaseDamage}
        onResourceGain={handleResourceGain}
      />
      
      <div className="mt-4 text-gray-400 text-sm">
        🎮 Враги идут к базе! Юниты атакуют автоматически
      </div>
    </div>
  );
}

export default App;