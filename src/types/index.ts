// Тип юнита
export type UnitType = 'melee' | 'ranged' | 'tank';

// Интерфейс юнита
export interface IUnit {
  id: string;
  x: number;
  y: number;
  type: UnitType;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  lastAttack: number;
}

// Интерфейс врага
export interface IEnemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  reward: number;
  speed: number;
  isBoss: boolean;
}