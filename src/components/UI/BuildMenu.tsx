import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface BuildMenuProps {
  onBuyUnit: (type: 'melee' | 'ranged' | 'tank') => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({ onBuyUnit }) => {
  const resources = useGameStore((state) => state.resources);
  
  const units = [
    { type: 'melee' as const, name: 'Мечник', icon: '⚔️', cost: 80, color: 'bg-blue-600', desc: 'Ближний бой, средний урон' },
    { type: 'ranged' as const, name: 'Лучник', icon: '🏹', cost: 100, color: 'bg-green-600', desc: 'Дальний бой, высокий урон' },
    { type: 'tank' as const, name: 'Танк', icon: '🛡️', cost: 120, color: 'bg-amber-700', desc: 'Много HP, низкий урон' }
  ];
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/90 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="text-white text-sm mb-2 text-center">🏗️ ПОСТРОЙКА ЮНИТОВ</div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {units.map((unit) => (
          <button
            key={unit.type}
            onClick={() => onBuyUnit(unit.type)}
            disabled={resources < unit.cost}
            className={`
              flex-shrink-0 px-4 py-3 rounded-lg text-white font-bold transition-all
              ${resources >= unit.cost 
                ? `${unit.color} hover:scale-105 active:scale-95` 
                : 'bg-gray-600 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="text-2xl">{unit.icon}</div>
            <div className="text-sm">{unit.name}</div>
            <div className="text-xs">{unit.cost}💰</div>
          </button>
        ))}
      </div>
      <div className="text-gray-400 text-xs text-center mt-2">
        💡 Юниты появляются вокруг базы и автоматически атакуют врагов
      </div>
    </div>
  );
};