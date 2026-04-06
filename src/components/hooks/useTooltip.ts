import { useState, useCallback } from 'react';
import { GameEngine } from '../../engine/GameEngine';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  stats: { label: string; value: string | number }[];
}

export const useTooltip = (engine: GameEngine | null) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    stats: []
  });

  const updateTooltip = useCallback((mouseX: number, mouseY: number, clientX: number, clientY: number) => {
    if (!engine) {
      setTooltip(prev => ({ ...prev, visible: false }));
      return;
    }

    engine.setHoveredEntity(mouseX, mouseY);
    
    const hoveredUnit = engine.getHoveredUnit();
    const hoveredEnemy = engine.getHoveredEnemy();
    
    if (hoveredUnit) {
      const typeName = hoveredUnit.type === 'melee' ? 'Мечник' : hoveredUnit.type === 'ranged' ? 'Лучник' : 'Танк';
      setTooltip({
        visible: true,
        x: clientX,
        y: clientY,
        title: `${hoveredUnit.getIcon()} ${typeName} Lv.${Math.ceil(hoveredUnit.hp / 100)}`,
        stats: [
          { label: '❤️ HP', value: `${Math.floor(hoveredUnit.hp)}/${hoveredUnit.maxHp}` },
          { label: '⚔️ Урон', value: Math.floor(hoveredUnit.damage) },
          { label: '📏 Дальность', value: hoveredUnit.attackRange },
          { label: '⏱️ Скорость атаки', value: hoveredUnit.attackCooldown.toFixed(1) }
        ]
      });
    } else if (hoveredEnemy) {
      const typeName = hoveredEnemy.isBoss ? 'БОСС' : hoveredEnemy.isTank ? 'Танк' : 'Монстр';
      setTooltip({
        visible: true,
        x: clientX,
        y: clientY,
        title: `${hoveredEnemy.getIcon()} ${typeName}`,
        stats: [
          { label: '❤️ HP', value: `${Math.floor(hoveredEnemy.hp)}/${hoveredEnemy.maxHp}` },
          { label: '⚔️ Урон', value: Math.floor(hoveredEnemy.damage) },
          { label: '💰 Награда', value: hoveredEnemy.reward },
          { label: '🏃 Скорость', value: Math.floor(hoveredEnemy.speed) }
        ]
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [engine]);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    if (engine) {
      engine.setHoveredEntity(-1000, -1000);
    }
  }, [engine]);

  return { tooltip, updateTooltip, hideTooltip };
};