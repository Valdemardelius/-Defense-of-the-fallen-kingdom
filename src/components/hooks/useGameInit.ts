import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SaveManager } from '../../lib/SaveManager';
import { type UnitType } from '../../types';

export const useGameInit = () => {
  const { loadFromSave, setUnitCounts } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnits, setTotalUnits] = useState(0);

  useEffect(() => {
    const saves = SaveManager.getAllSaves();
    if (saves.length > 0 && window.confirm(`Найдено ${saves.length} сохранений! Загрузить последнее?`)) {
      const latestSave = saves[0];
      const saveData = SaveManager.load(latestSave.id);
      if (saveData) {
        loadFromSave(saveData);
        const total = Object.values(saveData.unitCounts).reduce((a, b) => a + b, 0);
        setTotalUnits(total);
        setUnitCounts(saveData.unitCounts);
      }
    }
    setIsLoading(false);
  }, [loadFromSave, setUnitCounts]);

  return { isLoading, totalUnits, setTotalUnits };
};