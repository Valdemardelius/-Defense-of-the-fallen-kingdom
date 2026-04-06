export interface UnitStats {
  hp: number;
  damage: number;
  range: number;
  attackCooldown: number;
  cost: number;
  maxCount: number;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const UNIT_CONFIG = {
  melee: {
    hp: 100,
    damage: 20,
    range: 50,
    attackCooldown: 1.0,
    cost: 80,
    maxCount: 8,
    name: 'Мечник',
    icon: '⚔️',
    color: '#4169E1',
    bgColor: 'bg-blue-600',
    description: 'Ближний бой, средний урон'
  },
  ranged: {
    hp: 70,
    damage: 35,
    range: 120,
    attackCooldown: 0.8,
    cost: 100,
    maxCount: 6,
    name: 'Лучник',
    icon: '🏹',
    color: '#32CD32',
    bgColor: 'bg-green-600',
    description: 'Дальний бой, высокий урон'
  },
  tank: {
    hp: 200,
    damage: 12,
    range: 40,
    attackCooldown: 0.7,
    cost: 120,
    maxCount: 4,
    name: 'Танк',
    icon: '🛡️',
    color: '#CD7F32',
    bgColor: 'bg-amber-700',
    description: 'Много HP, низкий урон'
  }
} as const;

export type UnitType = keyof typeof UNIT_CONFIG;

export const TOTAL_MAX_UNITS = 18;

export const getUnitStats = (type: UnitType): UnitStats => {
  return UNIT_CONFIG[type];
};

export const getUnitCost = (type: UnitType): number => {
  return UNIT_CONFIG[type].cost;
};

export const getUnitMaxCount = (type: UnitType): number => {
  return UNIT_CONFIG[type].maxCount;
};

export const getAllUnits = () => {
  return Object.entries(UNIT_CONFIG).map(([type, stats]) => ({
    type: type as UnitType,
    ...stats
  }));
};