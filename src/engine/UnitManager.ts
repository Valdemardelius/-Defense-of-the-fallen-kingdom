import { GameEngine } from './GameEngine';
import { UNIT_CONFIG, TOTAL_MAX_UNITS, getUnitCost, getUnitStats, type UnitType } from '../config/units';

export class UnitManager {
  private engine: GameEngine;
  
  constructor(engine: GameEngine) {
    this.engine = engine;
  }
  
  public canAddUnit(type: UnitType): boolean {
    if (this.engine.units.length >= TOTAL_MAX_UNITS) {
      return false;
    }
    
    const maxCount = UNIT_CONFIG[type].maxCount;
    const currentCount = this.getUnitCountByType(type);
    
    return currentCount < maxCount;
  }
  
  public getUnitCountByType(type: UnitType): number {
    return this.engine.units.filter(u => u.type === type).length;
  }
  
  public addUnitAuto(type: UnitType, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
    if (!this.canAddUnit(type)) {
      const maxCount = UNIT_CONFIG[type].maxCount;
      const currentCount = this.getUnitCountByType(type);
      if (currentCount >= maxCount) {
        return { success: false, reason: `max_type_${type}` };
      }
      return { success: false, reason: 'max_units' };
    }
    
    const freePos = this.engine.getFreeHexInOrder();
    if (!freePos) {
      return { success: false, reason: 'no_space' };
    }
    
    const stats = getUnitStats(type);
    
    this.engine.units.push({
      id: Math.random().toString(36).substr(2, 9),
      x: freePos.x,
      y: freePos.y,
      type,
      hp: stats.hp * hpBonus,
      maxHp: stats.hp * hpBonus,
      damage: stats.damage * damageBonus,
      attackRange: stats.range,
      attackCooldown: stats.attackCooldown,
      lastAttack: 0,
      hexQ: freePos.q,
      hexR: freePos.r
    });
    
    this.engine.occupyHex(freePos.q, freePos.r);
    
    return { success: true };
  }
  
  public addUnitAtPosition(type: UnitType, x: number, y: number, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
    if (!this.canAddUnit(type)) {
      const maxCount = UNIT_CONFIG[type].maxCount;
      const currentCount = this.getUnitCountByType(type);
      if (currentCount >= maxCount) {
        return { success: false, reason: `max_type_${type}` };
      }
      return { success: false, reason: 'max_units' };
    }
    
    const hexAtPos = this.engine.getHexAtPixel(x, y);
    if (!hexAtPos) {
      return { success: false, reason: 'invalid_position' };
    }
    
    const distanceToBase = Math.hypot(hexAtPos.x - this.engine.baseX, hexAtPos.y - this.engine.baseY);
    if (distanceToBase < 40) {
      return { success: false, reason: 'too_close_to_base' };
    }
    
    const stats = getUnitStats(type);
    
    this.engine.units.push({
      id: Math.random().toString(36).substr(2, 9),
      x: hexAtPos.x,
      y: hexAtPos.y,
      type,
      hp: stats.hp * hpBonus,
      maxHp: stats.hp * hpBonus,
      damage: stats.damage * damageBonus,
      attackRange: stats.range,
      attackCooldown: stats.attackCooldown,
      lastAttack: 0,
      hexQ: hexAtPos.q,
      hexR: hexAtPos.r
    });
    
    this.engine.occupyHex(hexAtPos.q, hexAtPos.r);
    
    return { success: true };
  }
  
  public removeUnit(unitId: string): void {
    const unitIndex = this.engine.units.findIndex(u => u.id === unitId);
    if (unitIndex !== -1) {
      const unit = this.engine.units[unitIndex];
      if (unit.hexQ !== undefined && unit.hexR !== undefined) {
        this.engine.freeHex(unit.hexQ, unit.hexR);
      }
      this.engine.units.splice(unitIndex, 1);
    }
  }
}