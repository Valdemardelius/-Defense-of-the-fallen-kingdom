import { useCallback } from 'react';
import { GameEngine } from '../../engine/GameEngine';
import { UnitManager } from '../../engine/UnitManager';
import { getUnitCost, TOTAL_MAX_UNITS, UNIT_CONFIG, type UnitType } from '../../config/units';
import { useGameStore } from '../../store/gameStore';

export const useUnitManager = (engine: GameEngine | null, onUnitCountChange?: (count: number, countsByType: Record<UnitType, number>) => void) => {
  
  const getUnitCounts = useCallback(() => {
    if (!engine) return { melee: 0, ranged: 0, tank: 0 };
    return {
      melee: engine.units.filter(u => u.type === 'melee').length,
      ranged: engine.units.filter(u => u.type === 'ranged').length,
      tank: engine.units.filter(u => u.type === 'tank').length
    };
  }, [engine]);
  
  const buyUnitAuto = useCallback((type: UnitType) => {
    if (!engine) return;
    
    const cost = getUnitCost(type);
    const { spendResources, getUnitDamageBonus, getUnitHpBonus } = useGameStore.getState();
    const unitManager = new UnitManager(engine);
    
    if (useGameStore.getState().resources < cost) {
      alert(`❌ Недостаточно ресурсов! Нужно ${cost}💰`);
      return;
    }
    
    if (spendResources(cost)) {
      const damageBonus = getUnitDamageBonus();
      const hpBonus = getUnitHpBonus();
      
      const result = unitManager.addUnitAuto(type, damageBonus, hpBonus);
      
      if (!result.success) {
        spendResources(-cost);
        
        if (result.reason === 'max_units') {
          alert(`⚠️ Достигнут общий лимит юнитов (${TOTAL_MAX_UNITS})!`);
        } else if (result.reason === `max_type_${type}`) {
          const maxCount = UNIT_CONFIG[type].maxCount;
          alert(`⚠️ Достигнут лимит для ${UNIT_CONFIG[type].name} (${maxCount})!`);
        } else if (result.reason === 'no_space') {
          alert('⚠️ Нет свободного места!');
        }
      } else {
        if (onUnitCountChange) {
          const counts = getUnitCounts();
          onUnitCountChange(engine.units.length, counts);
        }
      }
    }
  }, [engine, onUnitCountChange, getUnitCounts]);
  
  const buyUnitAtPosition = useCallback((type: UnitType, x: number, y: number) => {
    if (!engine) return;
    
    const cost = getUnitCost(type);
    const { spendResources, getUnitDamageBonus, getUnitHpBonus } = useGameStore.getState();
    const unitManager = new UnitManager(engine);
    
    if (useGameStore.getState().resources < cost) {
      alert(`❌ Недостаточно ресурсов! Нужно ${cost}💰`);
      return;
    }
    
    if (spendResources(cost)) {
      const damageBonus = getUnitDamageBonus();
      const hpBonus = getUnitHpBonus();
      
      const result = unitManager.addUnitAtPosition(type, x, y, damageBonus, hpBonus);
      
      if (!result.success) {
        spendResources(-cost);
        
        if (result.reason === 'max_units') {
          alert(`⚠️ Достигнут общий лимит юнитов (${TOTAL_MAX_UNITS})!`);
        } else if (result.reason === `max_type_${type}`) {
          const maxCount = UNIT_CONFIG[type].maxCount;
          alert(`⚠️ Достигнут лимит для ${UNIT_CONFIG[type].name} (${maxCount})!`);
        } else if (result.reason === 'invalid_position') {
          alert('⚠️ Неверная позиция! Выберите свободный гекс.');
        } else if (result.reason === 'too_close_to_base') {
          alert('⚠️ Слишком близко к базе!');
        }
      } else {
        if (onUnitCountChange) {
          const counts = getUnitCounts();
          onUnitCountChange(engine.units.length, counts);
        }
      }
    }
  }, [engine, onUnitCountChange, getUnitCounts]);
  
  return { buyUnitAuto, buyUnitAtPosition, getUnitCounts };
};