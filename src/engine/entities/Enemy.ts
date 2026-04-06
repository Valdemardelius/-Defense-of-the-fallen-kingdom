import { Entity } from './Entity';
import { ENEMY_TYPES, type EnemyType } from '../config/enemies';

export class Enemy extends Entity {
  public type: EnemyType;
  public reward: number;
  public speed: number;
  public isBoss: boolean;
  public isTank: boolean;
  public targetUnitId?: string;
  
  constructor(
    type: EnemyType,
    x: number,
    y: number,
    wave: number,
    targetUnitId?: string
  ) {
    const config = ENEMY_TYPES[type];
    
    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`);
    }
    
    const hp = config.baseHp + wave * 3;
    const damage = config.baseDamage + Math.floor(wave / 3);
    const attackRange = 45;
    const attackCooldown = 1.0;
    
    super(x, y, hp, damage, attackRange, attackCooldown);
    
    this.type = type;
    this.reward = config.baseReward + wave;
    this.speed = config.baseSpeed + wave / 5;
    this.isBoss = type === 'boss';
    this.isTank = type === 'tank';
    this.targetUnitId = targetUnitId;
  }
  
  public getColor(): string {
    return ENEMY_TYPES[this.type].color;
  }
  
  public getIcon(): string {
    return ENEMY_TYPES[this.type].icon;
  }
}