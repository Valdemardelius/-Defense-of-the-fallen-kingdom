import { GameEngine } from './GameEngine';
import { Unit } from './entities';
import { UNIT_CONFIG, TOTAL_MAX_UNITS, type UnitType } from './config/units';
import { canAddUnit } from './utils';

export class UnitManager {
  private engine: GameEngine;
  
  constructor(engine: GameEngine) {
    this.engine = engine;
  }
  
  public canAddUnit(type: UnitType): boolean {
    return canAddUnit(this.engine.units, type).canAdd;
  }
  
  public addUnitAuto(type: UnitType, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
    const canAdd = canAddUnit(this.engine.units, type);
    if (!canAdd.canAdd) {
      return { success: false, reason: canAdd.reason };
    }
    
    const freePos = this.engine.getFreeHexInOrder();
    if (!freePos) {
      return { success: false, reason: 'no_space' };
    }
    
    const unit = new Unit(type, freePos.x, freePos.y, damageBonus, hpBonus, freePos.q, freePos.r);
    this.engine.units.push(unit);
    this.engine.occupyHex(freePos.q, freePos.r);
    
    return { success: true };
  }
  
  public addUnitAtPosition(type: UnitType, x: number, y: number, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
    return this.engine.addUnitAtPosition(type, x, y, damageBonus, hpBonus);
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