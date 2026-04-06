import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getAllUnits, TOTAL_MAX_UNITS, type UnitType } from '../../engine/config/units';

interface BuildMenuProps {
  onBuyUnit: (type: UnitType, x?: number, y?: number) => void;
  currentUnitCount: number;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement>; // TODO  коля насрал
}

export const BuildMenu: React.FC<BuildMenuProps> = ({ 
  onBuyUnit, 
  currentUnitCount,
  canvasRef
}) => {
  const [placementMode, setPlacementMode] = useState<UnitType | null>(null);
  const resources = useGameStore((state) => state.resources);
  const unitCountsByType = useGameStore((state) => state.unitCounts);
  const units = useMemo(() => getAllUnits(), []);
  
  const isAtMaxUnits = currentUnitCount >= TOTAL_MAX_UNITS;
  
  const canBuyUnit = (unit: typeof units[0]) => {
    const currentTypeCount = unitCountsByType[unit.type] || 0;
    return resources >= unit.cost && !isAtMaxUnits && currentTypeCount < unit.maxCount;
  };
  
  const handleBuyClick = (unit: typeof units[0]) => {
    if (!canBuyUnit(unit)) return;
    
    if (placementMode === unit.type) {
      setPlacementMode(null);
      if (canvasRef?.current?.setSelectedUnitType) {
        canvasRef.current.setSelectedUnitType(null);
      }
      onBuyUnit(unit.type);
    } else {
      setPlacementMode(unit.type);
      if (canvasRef?.current?.setSelectedUnitType) {
        canvasRef.current.setSelectedUnitType(unit.type);
      }
    }
  };
  
  const cancelPlacement = () => {
    setPlacementMode(null);
    if (canvasRef?.current?.setSelectedUnitType) {
      canvasRef.current.setSelectedUnitType(null);
    }
  };
  
  useEffect(() => {
    return () => {
      if (placementMode && canvasRef?.current?.setSelectedUnitType) {
        canvasRef.current.setSelectedUnitType(null);
      }
    };
  }, [placementMode, canvasRef]);
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/90 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="text-white text-sm mb-2 text-center flex justify-between items-center">
        <span>🏗️ ПОСТРОЙКА ЮНИТОВ</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isAtMaxUnits ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
            📊 {currentUnitCount} / {TOTAL_MAX_UNITS}
          </span>
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isAtMaxUnits ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${(currentUnitCount / TOTAL_MAX_UNITS) * 100}%` }}
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {units.map((unit) => {
          const canBuy = canBuyUnit(unit);
          const currentCount = unitCountsByType[unit.type] || 0;
          const isAtTypeLimit = currentCount >= unit.maxCount;
          const isPlacementMode = placementMode === unit.type;
          
          return (
            <button
              key={unit.type}
              onClick={() => handleBuyClick(unit)}
              disabled={!canBuy}
              className={`
                flex-shrink-0 px-4 py-3 rounded-lg text-white font-bold transition-all min-w-[100px]
                ${canBuy
                  ? isPlacementMode
                    ? 'bg-yellow-600 hover:scale-105 active:scale-95 cursor-pointer'
                    : `${unit.color} hover:scale-105 active:scale-95 cursor-pointer`
                  : 'bg-gray-600 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="text-2xl">{unit.icon}</div>
              <div className="text-sm font-bold">{unit.name}</div>
              <div className="text-xs">{unit.cost}💰</div>
              <div className={`text-[10px] mt-1 ${isAtTypeLimit ? 'text-red-400' : 'text-gray-400'}`}>
                {currentCount}/{unit.maxCount}
              </div>
            </button>
          );
        })}
      </div>
      
      {placementMode && (
        <div className="text-center text-yellow-400 text-sm mt-2 animate-pulse flex justify-between items-center bg-black/50 rounded-lg px-3 py-2">
          <span>🎯 Режим установки: нажми на любой свободный гекс</span>
          <button 
            onClick={cancelPlacement}
            className="text-red-400 text-xs underline px-2 py-1 bg-black/50 rounded"
          >
            Отмена
          </button>
        </div>
      )}
      
      <div className="text-gray-400 text-xs text-center mt-2">
        💡 Нажми на юнита → автоустановка | Нажми дважды → выбор места
      </div>
    </div>
  );
};