import type { UnitType } from '../engine/config/units';

export type { UnitType };

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
  hexQ?: number;
  hexR?: number;
}

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
  isTank?: boolean;
  attackRange?: number;
  attackCooldown?: number;
  lastAttackTime?: number;
  targetUnitId?: string;
}