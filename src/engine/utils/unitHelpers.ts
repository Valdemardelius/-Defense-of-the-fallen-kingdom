import { Unit, type UnitType } from '../entities';
import { UNIT_CONFIG, TOTAL_MAX_UNITS } from '../config/units';

export const getUnitCountByType = (units: Unit[], type: UnitType): number => {
  return units.filter(u => u.type === type).length;
};

export const getTotalUnitCount = (units: Unit[]): number => {
  return units.length;
};

export const canAddUnit = (
  units: Unit[],
  type: UnitType
): { canAdd: boolean; reason?: string } => {
  const currentCount = getTotalUnitCount(units);
  const currentTypeCount = getUnitCountByType(units, type);
  const maxCount = UNIT_CONFIG[type].maxCount;
  
  if (currentCount >= TOTAL_MAX_UNITS) {
    return { canAdd: false, reason: 'max_units' };
  }
  if (currentTypeCount >= maxCount) {
    return { canAdd: false, reason: `max_type_${type}` };
  }
  
  return { canAdd: true };
};

export const getUnitCountsMap = (units: Unit[]): Record<UnitType, number> => {
  return {
    melee: getUnitCountByType(units, 'melee'),
    ranged: getUnitCountByType(units, 'ranged'),
    tank: getUnitCountByType(units, 'tank')
  };
};