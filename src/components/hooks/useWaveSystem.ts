import { useRef, useEffect } from 'react';
import { GameEngine } from '../../engine/GameEngine';
import { createEnemy, type EnemyType } from '../../config/enemies';

interface UseWaveSystemProps {
  engine: GameEngine | null;
  width: number;
  height: number;
  onWaveStart: (wave: number) => void;
}

export const useWaveSystem = ({ engine, width, height, onWaveStart }: UseWaveSystemProps) => {
  const waveRef = useRef({
    count: 1,
    enemiesInWave: 5,
    enemiesSpawned: 0,
    isActive: true
  });
  
  const intervalsRef = useRef<{ spawn: NodeJS.Timeout | null; check: NodeJS.Timeout | null }>({
    spawn: null,
    check: null
  });

  useEffect(() => {
    if (!engine) return;

    onWaveStart(1);

    const getEnemyType = (wave: number, spawnIndex: number): EnemyType => {
      const isBoss = wave % 10 === 0 && spawnIndex === 0;
      if (isBoss) return 'boss';
      
      const isTank = wave > 2 && wave % 3 === 0 && Math.random() < 0.3;
      if (isTank) return 'tank';
      
      return 'normal';
    };

    const spawnEnemy = () => {
      if (!engine) return;
      const wave = waveRef.current;
      if (wave.enemiesSpawned >= wave.enemiesInWave) return;
      
      const side = Math.floor(Math.random() * 4);
      let x: number, y: number;
      
      switch(side) {
        case 0: x = 50 + Math.random() * 100; y = 50; break;
        case 1: x = width - 50; y = 50 + Math.random() * (height - 100); break;
        case 2: x = 50 + Math.random() * (width - 100); y = height - 50; break;
        default: x = 50; y = 50 + Math.random() * (height - 100);
      }
      
      const enemyType = getEnemyType(wave.count, wave.enemiesSpawned);
      const enemyConfig = createEnemy(enemyType, wave.count);
      
      engine.addEnemy({
        id: `enemy_${Date.now()}_${wave.enemiesSpawned}`,
        x, y,
        hp: enemyConfig.hp,
        maxHp: enemyConfig.hp,
        damage: enemyConfig.damage,
        reward: enemyConfig.reward,
        speed: enemyConfig.speed,
        isBoss: enemyConfig.isBoss,
        isTank: enemyConfig.isTank,
        attackRange: 45,
        attackCooldown: 1.0,
        lastAttackTime: 0
      });
      
      wave.enemiesSpawned++;
    };
    
    intervalsRef.current.spawn = setInterval(() => {
      const wave = waveRef.current;
      if (!engine) return;
      if (wave.enemiesSpawned >= wave.enemiesInWave) {
        if (intervalsRef.current.spawn) clearInterval(intervalsRef.current.spawn);
        intervalsRef.current.spawn = null;
        return;
      }
      spawnEnemy();
    }, 1500);
    
    intervalsRef.current.check = setInterval(() => {
      const wave = waveRef.current;
      if (!engine) return;
      
      if (wave.isActive && 
          wave.enemiesSpawned >= wave.enemiesInWave && 
          engine.enemies.length === 0) {
        wave.isActive = false;
        
        wave.count++;
        wave.enemiesInWave = 5 + Math.floor(wave.count / 3);
        wave.enemiesSpawned = 0;
        wave.isActive = true;
        
        onWaveStart(wave.count);
        
        if (intervalsRef.current.spawn) clearInterval(intervalsRef.current.spawn);
        intervalsRef.current.spawn = setInterval(() => {
          if (!engine) return;
          if (wave.enemiesSpawned >= wave.enemiesInWave) {
            if (intervalsRef.current.spawn) clearInterval(intervalsRef.current.spawn);
            intervalsRef.current.spawn = null;
            return;
          }
          spawnEnemy();
        }, 1500);
      }
    }, 500);
    
    return () => {
      if (intervalsRef.current.spawn) clearInterval(intervalsRef.current.spawn);
      if (intervalsRef.current.check) clearInterval(intervalsRef.current.check);
    };
  }, [engine, width, height, onWaveStart]);
};