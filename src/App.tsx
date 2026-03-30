import React, { useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { InfoPanel } from './components/UI/InfoPanel';
import { BuildMenu } from './components/UI/BuildMenu';
import { TechTree } from './components/UI/TechTree';
import { useGameStore } from './store/gameStore';

function App() {
  const { baseHp } = useGameStore();
  const [unitCount, setUnitCount] = useState(0);
  const canvasRef = useRef<any>(null);

  const handleUnitCountChange = (count: number) => {
    setUnitCount(count);
  };

  const handleBuyUnit = (type: 'melee' | 'ranged' | 'tank') => {
    if (canvasRef.current?.buyUnit) {
      canvasRef.current.buyUnit(type);
    }
  };

  if (baseHp <= 0) {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-light flex flex-col items-center justify-center p-2">
      <InfoPanel />
      <TechTree />
      
      <div className="mt-16 mb-32">
        <GameCanvas 
          ref={canvasRef}
          width={800} 
          height={600}
          onUnitCountChange={handleUnitCountChange}
        />
      </div>
      
      <BuildMenu 
        onBuyUnit={handleBuyUnit}
        currentUnitCount={unitCount}
        maxUnits={20}
      />
      
      <div className="fixed bottom-2 left-0 right-0 text-center text-gray-500 text-xs">
        🎮 Танки (золотая обводка) в приоритете у врагов | Максимум 20 юнитов
      </div>
    </div>
  );
}

export default App;