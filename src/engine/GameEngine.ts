import type { IUnit, IEnemy, UnitType } from '../types';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private baseX: number;
  private baseY: number;
  
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
    this.onBaseDamage = callbacks?.onBaseDamage;
    this.onEnemyKilled = callbacks?.onEnemyKilled;
  }
  
  private isPositionOccupied(x: number, y: number, radius: number = 25): boolean {
    for (const unit of this.units) {
      const dx = unit.x - x;
      const dy = unit.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance < radius) {
        return true;
      }
    }
    return false;
  }
  
  private findFreePositionAroundBase(): { x: number, y: number } | null {
    const radius = 70;
    const maxAttempts = 36;
    
    for (let i = 0; i < maxAttempts; i++) {
      const angle = (i / maxAttempts) * Math.PI * 2;
      const x = this.baseX + Math.cos(angle) * radius;
      const y = this.baseY + Math.sin(angle) * radius;
      
      if (!this.isPositionOccupied(x, y)) {
        return { x, y };
      }
    }
    
    for (let r = radius + 20; r <= radius + 100; r += 20) {
      for (let i = 0; i < maxAttempts; i++) {
        const angle = (i / maxAttempts) * Math.PI * 2;
        const x = this.baseX + Math.cos(angle) * r;
        const y = this.baseY + Math.sin(angle) * r;
        
        if (!this.isPositionOccupied(x, y)) {
          return { x, y };
        }
      }
    }
    
    return null;
  }
  
  public addUnit(type: UnitType, x?: number, y?: number, damageBonus: number = 1, hpBonus: number = 1): { success: boolean; reason?: string } {
  if (this.units.length >= 20) {
    return { success: false, reason: 'max_units' };
  }
  
  let spawnX = x;
  let spawnY = y;
  
  if (!spawnX || !spawnY) {
    const freePos = this.findFreePositionAroundBase();
    if (!freePos) {
      return { success: false, reason: 'no_space' };
    }
    spawnX = freePos.x;
    spawnY = freePos.y;
  }
  
  if (this.isPositionOccupied(spawnX, spawnY)) {
    return { success: false, reason: 'position_occupied' };
  }
  
  const stats = {
    melee: { hp: 100, damage: 20, range: 50, cooldown: 1.0 },
    ranged: { hp: 70, damage: 35, range: 120, cooldown: 0.8 },
    tank: { hp: 200, damage: 12, range: 40, cooldown: 0.7 }
  };
  
  const s = stats[type];
  
  this.units.push({
    id: Math.random().toString(36).substr(2, 9),
    x: spawnX,
    y: spawnY,
    type,
    hp: s.hp * hpBonus,
    maxHp: s.hp * hpBonus,
    damage: s.damage * damageBonus,
    attackRange: s.range,
    attackCooldown: s.cooldown,
    lastAttack: 0
  });
  
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
    const enemiesToRemove: IEnemy[] = [];
    
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
      
      if (distance < 15) {
        continue;
      }
      
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
        
        if (closestUnit) {
          targetUnit = closestUnit;
        }
      }
      
      if (targetUnit && !attackedBase) {
        targetUnit.hp -= enemy.damage;
        enemy.targetUnitId = targetUnit.id;
        enemy.lastAttackTime = currentTime;
        
        if (targetUnit.hp <= 0) {
          enemy.targetUnitId = undefined;
        }
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
      if (index !== -1) {
        this.enemies.splice(index, 1);
      }
    }
  }
  
  private removeDeadEntities() {
    this.units = this.units.filter(unit => unit.hp > 0);
  }
  
  public draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#2c5a2c';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawGrid();
    this.drawBase();
    this.drawUnits();
    this.drawEnemies();
  }
  
  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }
  
  private drawBase() {
    this.ctx.fillStyle = '#8B5A2B';
    this.ctx.fillRect(this.baseX - 25, this.baseY - 25, 50, 50);
    
    const hpPercent = this.baseHp / this.baseMaxHp;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 35, 70, 6);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.baseX - 35, this.baseY - 35, 70 * hpPercent, 6);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`БАЗА ${Math.floor(this.baseHp)}/${this.baseMaxHp}`, this.baseX - 30, this.baseY - 40);
  }
  
  private drawUnits() {
    for (const unit of this.units) {
      const colors = {
        melee: '#4169E1',
        ranged: '#32CD32',
        tank: '#8B4513'
      };
      
      this.ctx.fillStyle = colors[unit.type];
      this.ctx.beginPath();
      this.ctx.arc(unit.x, unit.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (unit.type === 'tank') {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(unit.x, unit.y, 14, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      
      const hpPercent = unit.hp / unit.maxHp;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(unit.x - 12, unit.y - 18, 24, 3);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(unit.x - 12, unit.y - 18, 24 * hpPercent, 3);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '12px Arial';
      const icons = { melee: '⚔️', ranged: '🏹', tank: '🛡️' };
      this.ctx.fillText(icons[unit.type], unit.x - 6, unit.y + 5);
      
      if (unit.type === 'tank') {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`${Math.floor(unit.hp)}`, unit.x - 8, unit.y - 20);
      }
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
      this.ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (enemy.isTank) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, 13, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('🛡️', enemy.x - 6, enemy.y - 12);
      }
      
      if (enemy.isBoss) {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('👑', enemy.x - 8, enemy.y - 15);
      }
      
      const hpPercent = enemy.hp / enemy.maxHp;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(enemy.x - 12, enemy.y - 15, 24, 3);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(enemy.x - 12, enemy.y - 15, 24 * hpPercent, 3);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`${enemy.damage}💥`, enemy.x - 8, enemy.y - 22);
    }
  }
}