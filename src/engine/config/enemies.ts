export const ENEMY_TYPES = {
  normal: {
    baseHp: 30,
    baseDamage: 8,
    baseReward: 15,
    baseSpeed: 45,
    name: 'Монстр',
    icon: '👾',
    color: '#CD5C5C'
  },
  tank: {
    baseHp: 75,
    baseDamage: 4,
    baseReward: 22,
    baseSpeed: 27,
    name: 'Танк',
    icon: '🛡️',
    color: '#FF8C00'
  },
  boss: {
    baseHp: 200,
    baseDamage: 15,
    baseReward: 100,
    baseSpeed: 30,
    name: 'Босс',
    icon: '👑',
    color: '#8B0000'
  }
} as const;

export type EnemyType = keyof typeof ENEMY_TYPES;

export const getEnemyColor = (type: EnemyType): string => {
  return ENEMY_TYPES[type].color;
};

export const getEnemyIcon = (type: EnemyType): string => {
  return ENEMY_TYPES[type].icon;
};

export interface IEnemyConfig {
  type: EnemyType;
  hp: number;
  damage: number;
  reward: number;
  speed: number;
  isBoss: boolean;
  isTank: boolean;
}

export const createEnemy = (
  type: EnemyType,
  wave: number,
  modifiers?: { hpMultiplier?: number; damageMultiplier?: number; rewardMultiplier?: number }
): IEnemyConfig => {
  const base = ENEMY_TYPES[type];
  
  let hp = base.baseHp + wave * 3;
  let damage = base.baseDamage + Math.floor(wave / 3);
  let reward = base.baseReward + wave;
  let speed = base.baseSpeed + wave / 5;
  
  if (modifiers?.hpMultiplier) hp *= modifiers.hpMultiplier;
  if (modifiers?.damageMultiplier) damage *= modifiers.damageMultiplier;
  if (modifiers?.rewardMultiplier) reward *= modifiers.rewardMultiplier;
  
  return {
    type,
    hp,
    damage,
    reward,
    speed,
    isBoss: type === 'boss',
    isTank: type === 'tank'
  };
};