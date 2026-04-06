import { Entity } from './Entity';
import { UNIT_CONFIG, type UnitType } from '../config/units';

export class Unit extends Entity {
  public type: UnitType;
  public hexQ?: number;
  public hexR?: number;
  
  constructor(type: UnitType, x: number, y: number, damageBonus: number = 1, hpBonus: number = 1, hexQ?: number, hexR?: number) {
    const config = UNIT_CONFIG[type];
    super(x, y, config.hp * hpBonus, config.damage * damageBonus, config.range, config.attackCooldown);
    this.type = type;
    this.hexQ = hexQ;
    this.hexR = hexR;
  }
  
  public getIcon(): string {
    return UNIT_CONFIG[this.type].icon;
  }
  
  public getColor(): string {
    return UNIT_CONFIG[this.type].color;
  }
}