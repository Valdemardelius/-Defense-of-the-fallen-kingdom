export interface IEntity {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  lastAttackTime: number;
}

export abstract class Entity implements IEntity {
  public id: string;
  public x: number;
  public y: number;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public attackRange: number;
  public attackCooldown: number;
  public lastAttackTime: number;
  
  constructor(x: number, y: number, hp: number, damage: number, attackRange: number, attackCooldown: number) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.damage = damage;
    this.attackRange = attackRange;
    this.attackCooldown = attackCooldown;
    this.lastAttackTime = 0;
  }
  
  public takeDamage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }
  
  public isAlive(): boolean {
    return this.hp > 0;
  }
  
  public getHealthPercent(): number {
    return this.hp / this.maxHp;
  }
}