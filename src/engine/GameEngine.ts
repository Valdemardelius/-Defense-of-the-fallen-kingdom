import { Unit, Enemy } from './entities';
import { HexGrid } from './HexGrid';
import { UNIT_CONFIG, TOTAL_MAX_UNITS, getUnitStats, type UnitType } from './config/units';
import { type EnemyType } from './config/enemies';
import { 
  generateId, drawHealthBar, drawCircle, drawIcon, drawText,
  getDistance, isInRange,
  getUnitCountByType, getUnitCountsMap, canAddUnit,
  getEnemyIcon, getEnemyIconSize
} from './utils';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private baseX: number;
  private baseY: number;
  private hexGrid: HexGrid;
  
  public units: Unit[] = [];
  public enemies: Enemy[] = [];
  public baseHp: number = 1000;
  public baseMaxHp: number = 1000;
  
  private onBaseDamage?: (damage: number) => void;
  private onEnemyKilled?: (reward: number) => void;
  private hoveredUnit: Unit | null = null;
  private hoveredEnemy: Enemy | null = null;
  
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
    const canAdd = canAddUnit(this.units, type);
    if (!canAdd.canAdd) {
      return { success: false, reason: canAdd.reason };
    }
    
    const hexAtPos = this.hexGrid.getHexAtPixel(x, y);
    if (!hexAtPos) {
      return { success: false, reason: 'invalid_position' };
    }
    
    const distanceToBase = getDistance(hexAtPos.x, hexAtPos.y, this.baseX, this.baseY);
    if (distanceToBase < 40) {
      return { success: false, reason: 'too_close_to_base' };
    }
    
    const unit = new Unit(type, hexAtPos.x, hexAtPos.y, damageBonus, hpBonus, hexAtPos.q, hexAtPos.r);
    this.units.push(unit);
    this.hexGrid.occupyHex(hexAtPos.q, hexAtPos.r);
    
    return { success: true };
  }
  
  public addEnemy(type: EnemyType, x: number, y: number, wave: number, targetUnitId?: string): void {
    const enemy = new Enemy(type, x, y, wave, targetUnitId);
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
        if (targetUnit && targetUnit.isAlive()) {
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
      if (currentTime - enemy.lastAttackTime < enemy.attackCooldown) continue;
      
      let targetUnit: Unit | null = null;
      let targetDistance = enemy.attackRange;
      
      const tanks = this.units.filter(u => u.type === 'tank' && u.isAlive());
      for (const tank of tanks) {
        const distance = getDistance(enemy.x, enemy.y, tank.x, tank.y);
        if (distance < targetDistance) {
          targetDistance = distance;
          targetUnit = tank;
        }
      }
      
      let attackedBase = false;
      if (!targetUnit) {
        const distanceToBase = getDistance(enemy.x, enemy.y, this.baseX, this.baseY);
        
        if (distanceToBase < 50) {
          this.baseHp -= enemy.damage;
          this.onBaseDamage?.(enemy.damage);
          enemy.lastAttackTime = currentTime;
          attackedBase = true;
        }
      }
      
      if (!targetUnit && !attackedBase) {
        let closestUnit: Unit | null = null;
        let closestDist = 100;
        
        for (const unit of this.units) {
          if (!unit.isAlive()) continue;
          const distance = getDistance(enemy.x, enemy.y, unit.x, unit.y);
          if (distance < closestDist) {
            closestDist = distance;
            closestUnit = unit;
          }
        }
        if (closestUnit) targetUnit = closestUnit;
      }
      
      if (targetUnit && !attackedBase) {
        const isDead = targetUnit.takeDamage(enemy.damage);
        enemy.targetUnitId = targetUnit.id;
        enemy.lastAttackTime = currentTime;
        if (isDead) enemy.targetUnitId = undefined;
      }
    }
  }
  
  private updateUnitsAttack() {
    const currentTime = performance.now() / 1000;
    const enemiesToRemove: Enemy[] = [];
    
    for (const unit of this.units) {
      if (!unit.isAlive()) continue;
      
      let targetEnemy: Enemy | null = null;
      let targetDistance = unit.attackRange;
      
      const enemyTanks = this.enemies.filter(e => e.isTank);
      for (const enemy of enemyTanks) {
        const distance = getDistance(unit.x, unit.y, enemy.x, enemy.y);
        if (distance < targetDistance) {
          targetDistance = distance;
          targetEnemy = enemy;
        }
      }
      
      if (!targetEnemy) {
        const bosses = this.enemies.filter(e => e.isBoss);
        for (const enemy of bosses) {
          const distance = getDistance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < targetDistance) {
            targetDistance = distance;
            targetEnemy = enemy;
          }
        }
      }
      
      if (!targetEnemy) {
        let closestEnemy: Enemy | null = null;
        let closestDist = unit.attackRange;
        for (const enemy of this.enemies) {
          const distance = getDistance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < closestDist) {
            closestDist = distance;
            closestEnemy = enemy;
          }
        }
        targetEnemy = closestEnemy;
      }
      
      if (targetEnemy && currentTime - unit.lastAttackTime >= unit.attackCooldown) {
        const isDead = targetEnemy.takeDamage(unit.damage);
        unit.lastAttackTime = currentTime;
        if (isDead) {
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
    const deadUnits = this.units.filter(unit => !unit.isAlive());
    for (const unit of deadUnits) {
      if (unit.hexQ !== undefined && unit.hexR !== undefined) {
        this.hexGrid.freeHex(unit.hexQ, unit.hexR);
      }
    }
    this.units = this.units.filter(unit => unit.isAlive());
  }
  
  public draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#1a3a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.hexGrid.draw(this.ctx);
    this.drawBase();
    this.drawUnits();
    this.drawEnemies();
    this.drawAttackRange();
  }
  
  private drawBase() {
    drawCircle(this.ctx, this.baseX, this.baseY, 30, '#8B5A2B');
    
    const hpPercent = this.baseHp / this.baseMaxHp;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 45, 70, 6);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 45, 70 * hpPercent, 6);
    
    drawText(this.ctx, `БАЗА ${Math.floor(this.baseHp)}/${this.baseMaxHp}`, this.baseX - 30, this.baseY - 48, 'white', 'bold 12px Arial');
  }
  
  private drawUnits() {
    for (const unit of this.units) {
      drawCircle(this.ctx, unit.x, unit.y, 14, unit.getColor(), 'white', 1);
      
      if (unit.type === 'tank') {
        drawCircle(this.ctx, unit.x, unit.y, 16, 'transparent', '#FFD700', 2);
      }
      
      drawHealthBar(this.ctx, unit.x, unit.y, unit.hp, unit.maxHp, 24, 3, -20);
      drawIcon(this.ctx, unit.x, unit.y, unit.getIcon(), '14px');
    }
  }
  
  private drawEnemies() {
    for (const enemy of this.enemies) {
      drawCircle(this.ctx, enemy.x, enemy.y, 12, enemy.getColor());
      
      if (enemy.isTank) {
        drawCircle(this.ctx, enemy.x, enemy.y, 14, 'transparent', '#FFD700', 2);
      }
      
      drawIcon(this.ctx, enemy.x, enemy.y, getEnemyIcon(enemy), getEnemyIconSize(enemy));
      drawHealthBar(this.ctx, enemy.x, enemy.y, enemy.hp, enemy.maxHp, 30, 4, -18);
    }
  }
  
  public setHoveredEntity(x: number, y: number): void {
    this.hoveredUnit = null;
    this.hoveredEnemy = null;
    
    for (const unit of this.units) {
      const distance = Math.hypot(unit.x - x, unit.y - y);
      if (distance < 14) {
        this.hoveredUnit = unit;
        break;
      }
    }
    
    if (!this.hoveredUnit) {
      for (const enemy of this.enemies) {
        const distance = Math.hypot(enemy.x - x, enemy.y - y);
        if (distance < 12) {
          this.hoveredEnemy = enemy;
          break;
        }
      }
    }
  }
  
  public getHoveredUnit(): Unit | null {
    return this.hoveredUnit;
  }
  
  public getHoveredEnemy(): Enemy | null {
    return this.hoveredEnemy;
  }
  
  private drawAttackRange(): void {
    if (this.hoveredUnit) {
      this.ctx.beginPath();
      this.ctx.arc(this.hoveredUnit.x, this.hoveredUnit.y, this.hoveredUnit.attackRange, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(100, 100, 255, 0.15)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    if (this.hoveredEnemy) {
      this.ctx.beginPath();
      this.ctx.arc(this.hoveredEnemy.x, this.hoveredEnemy.y, this.hoveredEnemy.attackRange, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 100, 100, 0.15)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
  
  public getHexAtPixel(x: number, y: number): { q: number; r: number; x: number; y: number } | null {
    return this.hexGrid.getHexAtPixel(x, y);
  }
  
  public drawHighlight(q: number, r: number): void {
    if (!this.ctx) return;
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
  
  public get unitsList(): Unit[] {
    return this.units;
  }
  
  public get enemiesList(): Enemy[] {
    return this.enemies;
  }
}