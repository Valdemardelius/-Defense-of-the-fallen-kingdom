import { useRef, useEffect } from 'react';
import { GameEngine } from '../../engine/GameEngine';
import { UnitManager } from '../../engine/UnitManager';
import { type UnitType } from '../../config/units';

interface UseGameLoopProps {
  canvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  onBaseDamage: (damage: number) => void;
  onEnemyKilled: (reward: number) => void;
  onUnitCountChange?: (count: number, countsByType: Record<UnitType, number>) => void;
}

export const useGameLoop = ({
  canvas,
  width,
  height,
  onBaseDamage,
  onEnemyKilled,
  onUnitCountChange
}: UseGameLoopProps) => {
  const engineRef = useRef<GameEngine | null>(null);
  const animationIdRef = useRef<number>(0);
  const unitCountRef = useRef(0);

  useEffect(() => {
    if (!canvas) return;

    const engine = new GameEngine(canvas, width, height, {
      onBaseDamage,
      onEnemyKilled
    });
    engineRef.current = engine;
    
    const unitManager = new UnitManager(engine);
    
    const startPositions = [
      { x: width / 2 - 70, y: height / 2 },
      { x: width / 2 + 70, y: height / 2 }
    ];
    
    startPositions.forEach(pos => {
      unitManager.addUnitAtPosition('melee', pos.x, pos.y);
    });
    
    if (onUnitCountChange) {
      const countsByType: Record<UnitType, number> = {
        melee: engine.units.filter(u => u.type === 'melee').length,
        ranged: engine.units.filter(u => u.type === 'ranged').length,
        tank: engine.units.filter(u => u.type === 'tank').length
      };
      onUnitCountChange(engine.units.length, countsByType);
      unitCountRef.current = engine.units.length;
    }

    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (engineRef.current) {
        engineRef.current.update(deltaTime);
        engineRef.current.draw();
        
        if (onUnitCountChange) {
          const currentCount = engineRef.current.units.length;
          if (currentCount !== unitCountRef.current) {
            unitCountRef.current = currentCount;
            const countsByType: Record<UnitType, number> = {
              melee: engineRef.current.units.filter(u => u.type === 'melee').length,
              ranged: engineRef.current.units.filter(u => u.type === 'ranged').length,
              tank: engineRef.current.units.filter(u => u.type === 'tank').length
            };
            onUnitCountChange(currentCount, countsByType);
          }
        }
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animationIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [canvas, width, height, onBaseDamage, onEnemyKilled, onUnitCountChange]);

  return { engine: engineRef.current };
};