import { Enemy } from '../entities';

export const getEnemyIcon = (enemy: Enemy): string => {
  if (enemy.isBoss) return '👑';
  if (enemy.isTank) return '🛡️';
  return '👾';
};

export const getEnemyIconSize = (enemy: Enemy): string => {
  if (enemy.isBoss) return '18px';
  if (enemy.isTank) return '12px';
  return '14px';
};