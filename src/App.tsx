import React, { useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { InfoPanel } from './components/UI/InfoPanel';
import { BuildMenu } from './components/UI/BuildMenu';
import { TechTree } from './components/UI/TechTree';
import { SaveMenu } from './components/UI/save';
import { LoadingScreen } from './components/LoadingScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useGameStore } from './store/gameStore';
import { useGameInit } from './components/hooks/useGameInit';
import { useUnitManagement } from './components/hooks/useUnitManagement';

function App() {
  const canvasRef = useRef<any>(null);
  const { baseHp } = useGameStore();
  const { isLoading, totalUnits, setTotalUnits } = useGameInit();
  const { handleUnitCountChange, handleBuyUnit } = useUnitManagement();

  const onBuyUnit = (type: any, x?: number, y?: number) => {
    handleBuyUnit(canvasRef, type, x, y);
  };

  if (isLoading) return <LoadingScreen />;
  if (baseHp <= 0) return <GameOverScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-dark to-game-light flex flex-col items-center justify-center p-2">
      <InfoPanel />
      <TechTree />
      <SaveMenu />
      
      <div className="mt-16 mb-32">
        <GameCanvas 
          ref={canvasRef}
          width={800} 
          height={600}
          onUnitCountChange={handleUnitCountChange}
        />
      </div>
      
      <BuildMenu 
        onBuyUnit={onBuyUnit}
        currentUnitCount={totalUnits}
        canvasRef={canvasRef}
      />
      
      <div className="fixed bottom-2 left-0 right-0 text-center text-gray-500 text-xs">
        🎮 Гексагональное поле | Танки в приоритете у врагов | Максимум 18 юнитов
      </div>
    </div>
  );
}

export default App;