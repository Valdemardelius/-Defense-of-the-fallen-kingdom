import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';

interface GameCanvasProps {
  width?: number;
  height?: number;
  onBaseDamage?: (damage: number) => void;
  onResourceGain?: (amount: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 800, 
  height = 600,
  onBaseDamage,
  onResourceGain
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [resources, setResources] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Создаем движок с колбэками
    const engine = new GameEngine(canvas, width, height, {
      onBaseDamage: (damage) => {
        console.log(`База получила ${damage} урона!`);
        onBaseDamage?.(damage);
      },
      onEnemyKilled: (reward) => {
        setResources(prev => prev + reward);
        onResourceGain?.(reward);
        console.log(`+${reward} ресурсов! Всего: ${resources + reward}`);
      }
    });
    engineRef.current = engine;

    engine.addUnit('melee', width / 2 - 80, height / 2);
    engine.addUnit('ranged', width / 2 + 80, height / 2);
    engine.addUnit('tank', width / 2, height / 2 - 80);
    
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
      cancelAnimationFrame(animationId);
    };
  }, [width, height, onBaseDamage, onResourceGain]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-2xl border-2 border-white/20"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg">
        💰 {resources}
      </div>
    </div>
  );
};
