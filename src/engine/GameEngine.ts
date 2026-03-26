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
  
  public addUnit(type: UnitType, x: number, y: number) {
    const stats = {
      melee: { hp: 100, damage: 20, range: 50, cooldown: 1.0 },
      ranged: { hp: 70, damage: 35, range: 120, cooldown: 0.8 },
      tank: { hp: 200, damage: 12, range: 40, cooldown: 0.7 }
    };
    
    const s = stats[type];
    
    this.units.push({
      id: Math.random().toString(36).substr(2, 9),
      x, y,
      type,
      hp: s.hp,
      maxHp: s.hp,
      damage: s.damage,
      attackRange: s.range,
      attackCooldown: s.cooldown,
      lastAttack: 0
    });
  }
  
  public addEnemy(enemy: IEnemy) {
    this.enemies.push(enemy);
  }
  
  public update(deltaTime: number) {
    const dt = Math.min(deltaTime, 0.033);
    this.updateEnemiesMovement(dt);
    this.updateUnitsAttack();
    this.removeDeadEntities();
  }
  
  private updateEnemiesMovement(dt: number) {
    const enemiesToRemove: IEnemy[] = [];
    
    for (const enemy of this.enemies) {
      const dx = this.baseX - enemy.x;
      const dy = this.baseY - enemy.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 15) {
        this.baseHp -= enemy.damage;
        this.onBaseDamage?.(enemy.damage);
        enemiesToRemove.push(enemy);
        continue;
      }
      
      const moveDistance = enemy.speed * dt;
      const ratio = Math.min(1, moveDistance / distance);
      enemy.x += dx * ratio;
      enemy.y += dy * ratio;
    }
    
    for (const enemy of enemiesToRemove) {
      const index = this.enemies.indexOf(enemy);
      if (index !== -1) {
        this.enemies.splice(index, 1);
      }
    }
  }
  
  private updateUnitsAttack() {
    const currentTime = performance.now() / 1000;
    const enemiesToRemove: IEnemy[] = [];
    
    for (const unit of this.units) {
      let closestEnemy: IEnemy | null = null;
      let closestDistance = unit.attackRange;
      
      for (const enemy of this.enemies) {
        const dx = unit.x - enemy.x;
        const dy = unit.y - enemy.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
      
      if (closestEnemy && currentTime - unit.lastAttack >= unit.attackCooldown) {
        closestEnemy.hp -= unit.damage;
        unit.lastAttack = currentTime;
        
        if (closestEnemy.hp <= 0) {
          enemiesToRemove.push(closestEnemy);
          this.onEnemyKilled?.(closestEnemy.reward);
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
      this.ctx.strokeStyle = 'white';
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
    }
  }
  
  private drawEnemies() {
    for (const enemy of this.enemies) {
      this.ctx.fillStyle = enemy.isBoss ? '#8B0000' : '#CD5C5C';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      const hpPercent = enemy.hp / enemy.maxHp;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(enemy.x - 12, enemy.y - 15, 24, 3);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(enemy.x - 12, enemy.y - 15, 24 * hpPercent, 3);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`${enemy.damage}💥`, enemy.x - 8, enemy.y - 18);
    }
  }
}
