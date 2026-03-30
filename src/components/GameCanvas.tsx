import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../store/gameStore';

interface GameCanvasProps {
  width?: number;
  height?: number;
  onUnitCountChange?: (count: number) => void;
}

export const GameCanvas = forwardRef<any, GameCanvasProps>(({ 
  width = 800, 
  height = 600,
  onUnitCountChange 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const { addResources, damageBase, nextWave } = useGameStore();
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  useImperativeHandle(ref, () => ({
    buyUnit: (type: 'melee' | 'ranged' | 'tank') => {
      handleBuyUnit(type);
    }
  }));

  const handleBuyUnit = (type: 'melee' | 'ranged' | 'tank') => {
  if (!engineRef.current) return;
  
  const costs = { melee: 80, ranged: 100, tank: 120 };
  const currentUnitCount = engineRef.current.units.length;
  
  if (currentUnitCount >= 20) {
    alert('⚠️ Достигнут лимит юнитов (20)!');
    return;
  }
  
  const { spendResources, getUnitDamageBonus, getUnitHpBonus } = useGameStore.getState();
  
  if (useGameStore.getState().resources < costs[type]) {
    alert(`❌ Недостаточно ресурсов! Нужно ${costs[type]}💰`);
    return;
  }
  
  if (spendResources(costs[type])) {
    const damageBonus = getUnitDamageBonus();
    const hpBonus = getUnitHpBonus();
    
    const result = engineRef.current.addUnit(type, undefined, undefined, damageBonus, hpBonus);
    
    if (!result.success) {
      spendResources(-costs[type]);
      
      if (result.reason === 'max_units') {
        alert('⚠️ Достигнут лимит юнитов (20)!');
      } else if (result.reason === 'no_space') {
        alert('⚠️ Нет свободного места вокруг базы!');
      } else if (result.reason === 'position_occupied') {
        alert('⚠️ Место занято, попробуйте позже');
      }
    } else {
      if (onUnitCountChange) {
        onUnitCountChange(engineRef.current.units.length);
      }
    }
  }
};

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const engine = new GameEngine(canvas, width, height, {
    onBaseDamage: (damage) => {
      damageBase(damage);
    },
    onEnemyKilled: (reward) => {
      addResources(reward);
      setEnemiesKilled(prev => prev + 1);
    }
  });
  engineRef.current = engine;

  engine.addUnit('melee');
  engine.addUnit('ranged');
  
  if (onUnitCountChange) {
    onUnitCountChange(engine.units.length);
  }

  let waveCount = 1;
  let enemiesInWave = 5;
  let enemiesSpawned = 0;
  let isWaveActive = true;
  let spawnInterval: NodeJS.Timeout | null = null;
  let checkInterval: NodeJS.Timeout | null = null;
  
  const { setWave } = useGameStore.getState();
  setWave(1);
  
  const spawnEnemy = () => {
    if (!engineRef.current) return;
    if (enemiesSpawned >= enemiesInWave) return;
    
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    
    switch(side) {
      case 0: x = 20 + Math.random() * 100; y = 20; break;
      case 1: x = width - 20; y = 20 + Math.random() * (height - 40); break;
      case 2: x = 20 + Math.random() * (width - 40); y = height - 20; break;
      default: x = 20; y = 20 + Math.random() * (height - 40);
    }
    
    let hp = 30 + waveCount * 3;
    let damage = 8 + Math.floor(waveCount / 3);
    let reward = 15 + waveCount;
    let speed = 40 + waveCount / 5;
    let isTank = false;
    
    if (waveCount > 2 && waveCount % 3 === 0 && Math.random() < 0.3) {
      isTank = true;
      hp = hp * 2.5;
      damage = damage * 0.5;
      reward = reward * 1.5;
      speed = speed * 0.6;
    }
    
    const isBoss = waveCount % 10 === 0 && enemiesSpawned === 0;
    
    engineRef.current.addEnemy({
      id: `enemy_${Date.now()}_${enemiesSpawned}`,
      x, y,
      hp: hp,
      maxHp: hp,
      damage: damage,
      reward: reward,
      speed: speed,
      isBoss: isBoss,
      isTank: isTank,
      attackRange: 45,
      attackCooldown: 1.0,
      lastAttackTime: 0
    });
    
    enemiesSpawned++;
  };
  
  spawnInterval = setInterval(() => {
    if (!engineRef.current) return;
    if (enemiesSpawned >= enemiesInWave) {
      if (spawnInterval) clearInterval(spawnInterval);
      spawnInterval = null;
      return;
    }
    spawnEnemy();
  }, 1500);
  
  checkInterval = setInterval(() => {
    if (!engineRef.current) return;
    
    if (isWaveActive && 
        enemiesSpawned >= enemiesInWave && 
        engineRef.current.enemies.length === 0) {
      isWaveActive = false;
      
      waveCount++;
      enemiesInWave = 5 + Math.floor(waveCount / 3);
      enemiesSpawned = 0;
      isWaveActive = true;
      
      setWave(waveCount);
      
      if (spawnInterval) clearInterval(spawnInterval);
      spawnInterval = setInterval(() => {
        if (!engineRef.current) return;
        if (enemiesSpawned >= enemiesInWave) {
          if (spawnInterval) clearInterval(spawnInterval);
          spawnInterval = null;
          return;
        }
        spawnEnemy();
      }, 1500);
    }
  }, 500);
  
  let lastTime = performance.now();
  
  const animate = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    if (engineRef.current) {
      engineRef.current.update(deltaTime);
      engineRef.current.draw();
      
      if (onUnitCountChange && engineRef.current.units.length !== unitCountRef.current) {
        unitCountRef.current = engineRef.current.units.length;
        onUnitCountChange(unitCountRef.current);
      }
    }
    
    requestAnimationFrame(animate);
  };
  
  const animationId = requestAnimationFrame(animate);
  
  return () => {
    if (spawnInterval) clearInterval(spawnInterval);
    if (checkInterval) clearInterval(checkInterval);
    cancelAnimationFrame(animationId);
  };
}, [width, height]);

  const unitCountRef = useRef(0);

  return (
  <div className="relative">
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg shadow-2xl border-2 border-white/20"
      style={{ touchAction: 'none' }}
    />
    
    {/* УДАЛИ ЭТОТ БЛОК - он дублирует кнопки */}
    {/* 
    <div className="absolute bottom-20 left-2 right-2 flex justify-center gap-2">
      <button onClick={() => handleBuyUnit('melee')}>⚔️ Мечник 80💰</button>
      <button onClick={() => handleBuyUnit('ranged')}>🏹 Лучник 100💰</button>
      <button onClick={() => handleBuyUnit('tank')}>🛡️ Танк 120💰</button>
    </div>
    */}
    
    <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-3 py-1 text-xs">
      <span className="text-gray-400">Юниты:</span>
      <span className={`ml-1 font-bold ${engineRef.current?.units.length >= 18 ? 'text-orange-400' : 'text-green-400'}`}>
        {engineRef.current?.units.length || 0}/20
      </span>
    </div>
  </div>
);
});

GameCanvas.displayName = 'GameCanvas';