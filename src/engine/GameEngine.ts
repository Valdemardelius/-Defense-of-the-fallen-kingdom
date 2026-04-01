import type { IUnit, IEnemy, UnitType } from '../types';
import { UNIT_CONFIG, TOTAL_MAX_UNITS, getUnitStats } from '../config/units';
import { HexGrid } from './HexGrid';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private baseX: number;
  private baseY: number;
  private hexGrid: HexGrid;
  
  public units: IUnit[] = [];
  public enemies: IEnemy[] = [];
  public baseHp: number = 1000;
  public baseMaxHp: number = 1000;
  
  private onBaseDamage?: (damage: number) => void;
  private onEnemyKilled?: (reward: number) => void;
  
  constructor(
    canvas: HTMLCanvasElement, 
    width: number, 
    height: number,
    callbacks?: {
      onBaseDamage?: (damage: number) => void;
      onEnemyKilled?: (reward: number) => void;
    }
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.baseX = width / 2;
    this.baseY = height / 2;
    this.hexGrid = new HexGrid(this.baseX, this.baseY, 32);
    this.onBaseDamage = callbacks?.onBaseDamage;
    this.onEnemyKilled = callbacks?.onEnemyKilled;
  }
  
  public addUnitAtPosition(type: UnitType, x: number, y: number, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
    const maxCount = UNIT_CONFIG[type].maxCount;
    const currentCount = this.units.filter(u => u.type === type).length;
    
    if (this.units.length >= TOTAL_MAX_UNITS) {
      return { success: false, reason: 'max_units' };
    }
    if (currentCount >= maxCount) {
      return { success: false, reason: `max_type_${type}` };
    }
    
    const hexAtPos = this.hexGrid.getHexAtPixel(x, y);
    if (!hexAtPos) {
      return { success: false, reason: 'invalid_position' };
    }
    
    const distanceToBase = Math.hypot(hexAtPos.x - this.baseX, hexAtPos.y - this.baseY);
    if (distanceToBase < 40) {
      return { success: false, reason: 'too_close_to_base' };
    }
    
    const stats = getUnitStats(type);
    
    this.units.push({
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
    
    this.hexGrid.occupyHex(hexAtPos.q, hexAtPos.r);
    
    return { success: true };
  }
  
  public addEnemy(enemy: IEnemy) {
    this.enemies.push(enemy);
  }
  
  public update(deltaTime: number) {
    const dt = Math.min(deltaTime, 0.033);
    this.updateEnemiesMovement(dt);
    this.updateEnemiesAttack();
    this.updateUnitsAttack();
    this.removeDeadEntities();
  }
  
  private updateEnemiesMovement(dt: number) {
    for (const enemy of this.enemies) {
      let targetX = this.baseX;
      let targetY = this.baseY;
      
      if (enemy.targetUnitId) {
        const targetUnit = this.units.find(u => u.id === enemy.targetUnitId);
        if (targetUnit && targetUnit.hp > 0) {
          targetX = targetUnit.x;
          targetY = targetUnit.y;
        } else {
          enemy.targetUnitId = undefined;
        }
      }
      
      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 15) continue;
      
      const moveDistance = enemy.speed * dt;
      const ratio = Math.min(1, moveDistance / distance);
      enemy.x += dx * ratio;
      enemy.y += dy * ratio;
    }
  }
  
  private updateEnemiesAttack() {
    const currentTime = performance.now() / 1000;
    
    for (const enemy of this.enemies) {
      if (currentTime - (enemy.lastAttackTime || 0) < (enemy.attackCooldown || 1.0)) {
        continue;
      }
      
      let targetUnit: IUnit | null = null;
      let targetDistance = enemy.attackRange || 50;
      
      const tanks = this.units.filter(u => u.type === 'tank' && u.hp > 0);
      for (const tank of tanks) {
        const dx = enemy.x - tank.x;
        const dy = enemy.y - tank.y;
        const distance = Math.hypot(dx, dy);
        if (distance < targetDistance) {
          targetDistance = distance;
          targetUnit = tank;
        }
      }
      
      let attackedBase = false;
      if (!targetUnit) {
        const dx = enemy.x - this.baseX;
        const dy = enemy.y - this.baseY;
        const distanceToBase = Math.hypot(dx, dy);
        
        if (distanceToBase < 50) {
          this.baseHp -= enemy.damage;
          this.onBaseDamage?.(enemy.damage);
          enemy.lastAttackTime = currentTime;
          attackedBase = true;
        }
      }
      
      if (!targetUnit && !attackedBase) {
        let closestUnit: IUnit | null = null;
        let closestDist = 100;
        
        for (const unit of this.units) {
          if (unit.hp <= 0) continue;
          const dx = enemy.x - unit.x;
          const dy = enemy.y - unit.y;
          const distance = Math.hypot(dx, dy);
          if (distance < closestDist) {
            closestDist = distance;
            closestUnit = unit;
          }
        }
        if (closestUnit) targetUnit = closestUnit;
      }
      
      if (targetUnit && !attackedBase) {
        targetUnit.hp -= enemy.damage;
        enemy.targetUnitId = targetUnit.id;
        enemy.lastAttackTime = currentTime;
        if (targetUnit.hp <= 0) enemy.targetUnitId = undefined;
      }
    }
  }
  
  private updateUnitsAttack() {
    const currentTime = performance.now() / 1000;
    const enemiesToRemove: IEnemy[] = [];
    
    for (const unit of this.units) {
      if (unit.hp <= 0) continue;
      
      let targetEnemy: IEnemy | null = null;
      let targetDistance = unit.attackRange;
      
      const enemyTanks = this.enemies.filter(e => e.isTank === true);
      for (const enemy of enemyTanks) {
        const dx = unit.x - enemy.x;
        const dy = unit.y - enemy.y;
        const distance = Math.hypot(dx, dy);
        if (distance < targetDistance) {
          targetDistance = distance;
          targetEnemy = enemy;
        }
      }
      
      if (!targetEnemy) {
        const bosses = this.enemies.filter(e => e.isBoss);
        for (const enemy of bosses) {
          const dx = unit.x - enemy.x;
          const dy = unit.y - enemy.y;
          const distance = Math.hypot(dx, dy);
          if (distance < targetDistance) {
            targetDistance = distance;
            targetEnemy = enemy;
          }
        }
      }
      
      if (!targetEnemy) {
        let closestEnemy: IEnemy | null = null;
        let closestDist = unit.attackRange;
        for (const enemy of this.enemies) {
          const dx = unit.x - enemy.x;
          const dy = unit.y - enemy.y;
          const distance = Math.hypot(dx, dy);
          if (distance < closestDist) {
            closestDist = distance;
            closestEnemy = enemy;
          }
        }
        targetEnemy = closestEnemy;
      }
      
      if (targetEnemy && currentTime - unit.lastAttack >= unit.attackCooldown) {
        targetEnemy.hp -= unit.damage;
        unit.lastAttack = currentTime;
        if (targetEnemy.hp <= 0) {
          enemiesToRemove.push(targetEnemy);
          this.onEnemyKilled?.(targetEnemy.reward);
        }
      }
    }
    
    for (const enemy of enemiesToRemove) {
      const index = this.enemies.indexOf(enemy);
      if (index !== -1) this.enemies.splice(index, 1);
    }
  }
  
  private removeDeadEntities() {
    const deadUnits = this.units.filter(unit => unit.hp <= 0);
    for (const unit of deadUnits) {
      if (unit.hexQ !== undefined && unit.hexR !== undefined) {
        this.hexGrid.freeHex(unit.hexQ, unit.hexR);
      }
    }
    this.units = this.units.filter(unit => unit.hp > 0);
  }
  
  public draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#1a3a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.hexGrid.draw(this.ctx);
    this.drawBase();
    this.drawUnits();
    this.drawEnemies();
  }
  
  private drawBase() {
    this.ctx.fillStyle = '#8B5A2B';
    this.ctx.beginPath();
    this.ctx.arc(this.baseX, this.baseY, 30, 0, Math.PI * 2);
    this.ctx.fill();
    
    const hpPercent = this.baseHp / this.baseMaxHp;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 45, 70, 6);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 45, 70 * hpPercent, 6);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`БАЗА ${Math.floor(this.baseHp)}/${this.baseMaxHp}`, this.baseX - 30, this.baseY - 48);
  }
  
  private drawUnits() {
    const colors = { melee: '#4169E1', ranged: '#32CD32', tank: '#CD7F32' };
    const icons = { melee: '⚔️', ranged: '🏹', tank: '🛡️' };
    
    for (const unit of this.units) {
      this.ctx.fillStyle = colors[unit.type];
      this.ctx.beginPath();
      this.ctx.arc(unit.x, unit.y, 14, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (unit.type === 'tank') {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(unit.x, unit.y, 16, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      
      const hpPercent = unit.hp / unit.maxHp;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(unit.x - 12, unit.y - 20, 24, 3);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(unit.x - 12, unit.y - 20, 24 * hpPercent, 3);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(icons[unit.type], unit.x - 8, unit.y + 5);
    }
  }
  
  private drawEnemies() {
    for (const enemy of this.enemies) {
      if (enemy.isBoss) {
        this.ctx.fillStyle = '#8B0000';
      } else if (enemy.isTank) {
        this.ctx.fillStyle = '#FF8C00';
      } else {
        this.ctx.fillStyle = '#CD5C5C';
      }
      
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (enemy.isTank) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('🛡️', enemy.x - 6, enemy.y - 14);
      }
      
      if (enemy.isBoss) {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('👑', enemy.x - 10, enemy.y - 18);
      }
      
      const hpPercent = enemy.hp / enemy.maxHp;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(enemy.x - 15, enemy.y - 18, 30, 4);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(enemy.x - 15, enemy.y - 18, 30 * hpPercent, 4);
    }
  }
  
  public getHexAtPixel(x: number, y: number): { q: number; r: number; x: number; y: number } | null {
  const result = this.hexGrid.getHexAtPixel(x, y);
  return result;
}
  
  public drawHighlight(q: number, r: number): void {
  if (!this.ctx) {
    return;
  }
  this.hexGrid.drawHighlight(this.ctx, q, r);
}
  
  public getFreeHexInOrder(): { x: number; y: number; q: number; r: number } | null {
    return this.hexGrid.getFreeHexInOrder();
  }
  
  public occupyHex(q: number, r: number): void {
    this.hexGrid.occupyHex(q, r);
  }
  
  public freeHex(q: number, r: number): void {
    this.hexGrid.freeHex(q, r);
  }
}