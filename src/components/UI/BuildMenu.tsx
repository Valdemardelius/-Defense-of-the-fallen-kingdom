import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface BuildMenuProps {
  onBuyUnit: (type: 'melee' | 'ranged' | 'tank') => void;
  currentUnitCount?: number;
  maxUnits?: number;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({ 
  onBuyUnit, 
  currentUnitCount = 0, 
  maxUnits = 20 
}) => {
  const resources = useGameStore((state) => state.resources);
  
  const units = [
    { type: 'melee' as const, name: 'Мечник', icon: '⚔️', cost: 80, color: 'bg-blue-600', desc: 'Ближний бой, средний урон' },
    { type: 'ranged' as const, name: 'Лучник', icon: '🏹', cost: 100, color: 'bg-green-600', desc: 'Дальний бой, высокий урон' },
    { type: 'tank' as const, name: 'Танк', icon: '🛡️', cost: 120, color: 'bg-amber-700', desc: 'Много HP, низкий урон' }
  ];
  
  const isAtMaxUnits = currentUnitCount >= maxUnits;
  const remainingSlots = maxUnits - currentUnitCount;
  
  const canBuyUnit = (cost: number) => {
    return resources >= cost && !isAtMaxUnits;
  };
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/90 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="text-white text-sm mb-2 text-center flex justify-between items-center">
        <span>🏗️ ПОСТРОЙКА ЮНИТОВ</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isAtMaxUnits ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
            📊 {currentUnitCount} / {maxUnits}
          </span>
          {!isAtMaxUnits && remainingSlots <= 3 && (
            <span className="text-xs text-orange-400">⚠️ Осталось {remainingSlots} мест</span>
          )}
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isAtMaxUnits ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${(currentUnitCount / maxUnits) * 100}%` }}
        />
      </div>
      
      {isAtMaxUnits && (
        <div className="text-center text-red-400 text-xs mb-2 font-bold animate-pulse">
          ⚠️ ДОСТИГНУТ ЛИМИТ ЮНИТОВ! ({maxUnits})
        </div>
      )}
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {units.map((unit) => {
          const canBuy = canBuyUnit(unit.cost);
          const isBlocked = isAtMaxUnits;
          
          return (
            <button
              key={unit.type}
              onClick={() => {
                if (canBuy && !isBlocked) {
                  onBuyUnit(unit.type);
                } else if (isBlocked) {
                  alert(`⚠️ Лимит юнитов достигнут! Максимум ${maxUnits}.`);
                } else if (!canBuy) {
                  alert(`❌ Недостаточно ресурсов! Нужно ${unit.cost}💰`);
                }
              }}
              disabled={!canBuy || isBlocked}
              className={`
                flex-shrink-0 px-4 py-3 rounded-lg text-white font-bold transition-all
                ${canBuy && !isBlocked
                  ? `${unit.color} hover:scale-105 active:scale-95 cursor-pointer` 
                  : 'bg-gray-600 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="text-2xl">{unit.icon}</div>
              <div className="text-sm font-bold">{unit.name}</div>
              <div className="text-xs">{unit.cost}💰</div>
              {!isBlocked && remainingSlots <= 3 && (
                <div className="text-[10px] mt-1 text-yellow-300">
                  мест: {remainingSlots}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
    </div>
  );
};