import { useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { type UnitType } from '../../types';

export const useUnitManagement = () => {
  const { setUnitCounts } = useGameStore();

  const handleUnitCountChange = useCallback((count: number, countsByType: Record<UnitType, number>) => {
    setUnitCounts(countsByType);
  }, [setUnitCounts]);

  const handleBuyUnit = useCallback((canvasRef: React.MutableRefObject<any>, type: UnitType, x?: number, y?: number) => {
    if (canvasRef.current?.buyUnit) {
      canvasRef.current.buyUnit(type, x, y);
    }
  }, []);

  return { handleUnitCountChange, handleBuyUnit };
};