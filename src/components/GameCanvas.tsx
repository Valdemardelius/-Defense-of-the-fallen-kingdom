import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { useGameStore } from '../store/gameStore';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const { resources, addResources, damageBase, nextWave } = useGameStore();
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Создаем движок с колбэками
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

<<<<<<< Updated upstream
    // Добавляем стартовых юнитов
=======
<<<<<<< HEAD
    // Добавляем стартовых юнитов
=======
>>>>>>> 7e8e122090f21a1466576da626698f7bfa1a3a95
>>>>>>> Stashed changes
    engine.addUnit('melee', width / 2 - 80, height / 2);
    engine.addUnit('ranged', width / 2 + 80, height / 2);

    // Система волн
    let waveCount = 0;
    let enemiesInWave = 0;
    let enemiesSpawned = 0;
    
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
>>>>>>> Stashed changes
    const startWave = () => {
      waveCount++;
      nextWave();
      enemiesInWave = 5 + Math.floor(waveCount / 3);
      enemiesSpawned = 0;
      console.log(`🌊 Волна ${waveCount} началась! ${enemiesInWave} врагов`);
    };
    
    const spawnEnemy = () => {
      if (!engineRef.current) return;
      if (enemiesSpawned >= enemiesInWave) return;
      
      // Спавним врага с края экрана
      const side = Math.floor(Math.random() * 4);
      let x: number, y: number;
      
      switch(side) {
        case 0: x = 20 + Math.random() * 100; y = 20; break;
        case 1: x = width - 20; y = 20 + Math.random() * (height - 40); break;
        case 2: x = 20 + Math.random() * (width - 40); y = height - 20; break;
        default: x = 20; y = 20 + Math.random() * (height - 40);
<<<<<<< Updated upstream
      }
      
      // Сила врага зависит от волны
      const hp = 30 + waveCount * 3;
      const damage = 5 + Math.floor(waveCount / 4);
      const reward = 15 + waveCount;
      
      engineRef.current.addEnemy({
        id: `enemy_${Date.now()}_${enemiesSpawned}`,
        x, y,
        hp: hp,
        maxHp: hp,
        damage: damage,
        reward: reward,
        speed: 40 + waveCount / 5,
        isBoss: waveCount % 10 === 0 && enemiesSpawned === 0 // Каждую 10 волну босс
      });
      
      enemiesSpawned++;
    };
    
    // Запускаем первую волну
    startWave();
    
    // Интервал спавна врагов
    const spawnInterval = setInterval(() => {
      if (engineRef.current && enemiesSpawned < enemiesInWave) {
        spawnEnemy();
      }
    }, 1500);
    
    // Проверка завершения волны
    const checkWaveComplete = setInterval(() => {
      if (engineRef.current && 
          enemiesSpawned >= enemiesInWave && 
          engineRef.current.enemies.length === 0) {
        startWave();
      }
    }, 500);
=======
      }
      
      // Сила врага зависит от волны
      const hp = 30 + waveCount * 3;
      const damage = 5 + Math.floor(waveCount / 4);
      const reward = 15 + waveCount;
      
      engineRef.current.addEnemy({
        id: `enemy_${Date.now()}_${enemiesSpawned}`,
        x, y,
        hp: hp,
        maxHp: hp,
        damage: damage,
        reward: reward,
        speed: 40 + waveCount / 5,
        isBoss: waveCount % 10 === 0 && enemiesSpawned === 0 // Каждую 10 волну босс
      });
      
      enemiesSpawned++;
    };
    
    // Запускаем первую волну
    startWave();
    
    // Интервал спавна врагов
    const spawnInterval = setInterval(() => {
      if (engineRef.current && enemiesSpawned < enemiesInWave) {
        spawnEnemy();
      }
    }, 1500);
    
    // Проверка завершения волны
    const checkWaveComplete = setInterval(() => {
      if (engineRef.current && 
          enemiesSpawned >= enemiesInWave && 
          engineRef.current.enemies.length === 0) {
        startWave();
      }
    }, 500);
=======
    let enemyCount = 0;
    const spawnInterval = setInterval(() => {
      if (engineRef.current) {
        const side = Math.floor(Math.random() * 4);
        let x: number, y: number;
        
        switch(side) {
          case 0:
            x = Math.random() * width;
            y = 20;
            break;
          case 1:
            x = width - 20;
            y = Math.random() * height;
            break;
          case 2:
            x = Math.random() * width;
            y = height - 20;
            break;
          default:
            x = 20;
            y = Math.random() * height;
        }
        
        enemyCount++;
        engineRef.current.addEnemy({
          id: `enemy_${Date.now()}_${enemyCount}`,
          x, y,
          hp: 40 + Math.floor(enemyCount / 5) * 10,
          maxHp: 40 + Math.floor(enemyCount / 5) * 10,
          damage: 8 + Math.floor(enemyCount / 10),
          reward: 15 + Math.floor(enemyCount / 3),
          speed: 40 + Math.random() * 20,
          isBoss: false
        });
      }
    }, 3000);
>>>>>>> 7e8e122090f21a1466576da626698f7bfa1a3a95
>>>>>>> Stashed changes

    
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (engineRef.current) {
        engineRef.current.update(deltaTime);
        engineRef.current.draw();
      }
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      clearInterval(spawnInterval);
      clearInterval(checkWaveComplete);
      cancelAnimationFrame(animationId);
    };
  }, [width, height]);

  // Функция покупки юнита
  const handleBuyUnit = (type: 'melee' | 'ranged' | 'tank') => {
    if (!engineRef.current) return;
    
    const costs = { melee: 80, ranged: 100, tank: 120 };
    const { spendResources } = useGameStore.getState();
    
    if (spendResources(costs[type])) {
      // Размещаем юнита вокруг базы
      const angle = Math.random() * Math.PI * 2;
      const radius = 70;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      
      engineRef.current.addUnit(type, x, y);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-2xl border-2 border-white/20"
        style={{ touchAction: 'none' }}
      />
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
>>>>>>> Stashed changes
      
      {/* Кнопки быстрой покупки на канвасе (для мобильных) */}
      <div className="absolute bottom-20 left-2 right-2 flex justify-center gap-2">
        <button
          onClick={() => handleBuyUnit('melee')}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          ⚔️ Мечник 80💰
        </button>
        <button
          onClick={() => handleBuyUnit('ranged')}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          🏹 Лучник 100💰
        </button>
        <button
          onClick={() => handleBuyUnit('tank')}
          className="bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          🛡️ Танк 120💰
        </button>
<<<<<<< Updated upstream
=======
=======
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg">
        💰 {resources}
>>>>>>> 7e8e122090f21a1466576da626698f7bfa1a3a95
>>>>>>> Stashed changes
      </div>
    </div>
  );
};
