import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const InfoPanel: React.FC = () => {
  const { resources, baseHp, wave } = useGameStore();
  const hpPercent = (baseHp / 1000) * 100;
  
  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between gap-2">
      {/* Ресурсы */}
      <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-yellow-500/50">
        <div className="text-yellow-400 text-xs">РЕСУРСЫ</div>
        <div className="text-white font-bold text-xl">💰 {Math.floor(resources)}</div>
      </div>
      
      {/* База HP */}
      <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-red-500/50 flex-1 max-w-[200px]">
        <div className="text-red-400 text-xs">БАЗА</div>
        <div className="text-white font-bold text-lg">{Math.floor(baseHp)} / 1000</div>
        <div className="w-full h-2 bg-red-900 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
      
      {/* Волна */}
      <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-blue-500/50">
        <div className="text-blue-400 text-xs">ВОЛНА</div>
        <div className="text-white font-bold text-xl">🌊 {wave}</div>
      </div>
    </div>
  );
};