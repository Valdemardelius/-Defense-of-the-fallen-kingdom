import React, { useRef, forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { TOTAL_MAX_UNITS, type UnitType } from '../engine/config/units';
import { Tooltip } from './UI/Tooltip';
import { useGameLoop } from './hooks/useGameLoop';
import { useWaveSystem } from './hooks/useWaveSystem';
import { useUnitManager } from './hooks/useUnitManager';
import { useTooltip } from './hooks/useTooltip';
import { useHoverHex } from './hooks/useHoverHex';
import { useHighlight } from './hooks/useHighlight';

interface GameCanvasProps {
  width?: number;
  height?: number;
  onUnitCountChange?: (count: number, countsByType: Record<UnitType, number>) => void;
}

export const GameCanvas = forwardRef<any, GameCanvasProps>(({ 
  width = 800, 
  height = 600,
  onUnitCountChange 
}, ref) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const { addResources, damageBase, setWave } = useGameStore();
  
  const canvasRefCallback = useCallback((node: HTMLCanvasElement | null) => {
    if (node) setCanvas(node);
  }, []);
  
  const { engine } = useGameLoop({
    canvas,
    width,
    height,
    onBaseDamage: damageBase,
    onEnemyKilled: addResources,
    onUnitCountChange
  });
  
  useWaveSystem({
    engine,
    width,
    height,
    onWaveStart: setWave
  });
  
  const { buyUnitAuto, buyUnitAtPosition } = useUnitManager(engine, onUnitCountChange);
  
  const { tooltip, updateTooltip, hideTooltip } = useTooltip(engine);
  const { hoverHex, updateHoverHex, clearHoverHex } = useHoverHex(engine);
  useHighlight(engine, hoverHex, selectedUnitType);
  
  useImperativeHandle(ref, () => ({
    buyUnit: (type: UnitType, x?: number, y?: number) => {
      if (x !== undefined && y !== undefined) {
        buyUnitAtPosition(type, x, y);
      } else {
        buyUnitAuto(type);
      }
    },
    setSelectedUnitType: (type: UnitType | null) => {
      setSelectedUnitType(type);
    }
  }));
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedUnitType || !engine) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const hexAtPos = engine.getHexAtPixel(mouseX, mouseY);
    if (!hexAtPos) {
      alert('⚠️ Выберите свободный гекс!');
      return;
    }
    
    buyUnitAtPosition(selectedUnitType, mouseX, mouseY);
    setSelectedUnitType(null);
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engine) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    updateHoverHex(mouseX, mouseY);
    updateTooltip(mouseX, mouseY, e.clientX, e.clientY);
  };
  
  const handleCanvasMouseLeave = () => {
    clearHoverHex();
    hideTooltip();
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRefCallback}
        width={width}
        height={height}
        className="rounded-lg shadow-2xl border-2 border-white/20 cursor-crosshair"
        style={{ touchAction: 'none', backgroundColor: '#1a3a1a' }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
      />
      
      <Tooltip
        x={tooltip.x}
        y={tooltip.y}
        title={tooltip.title}
        stats={tooltip.stats}
        visible={tooltip.visible}
      />
      
      {selectedUnitType && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse whitespace-nowrap z-50">
          🎯 Выбери место для юнита (нажми на свободный гекс)
        </div>
      )}
      
      <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-3 py-1 text-xs">
        <span className="text-gray-400">Юниты:</span>
        <span className={`ml-1 font-bold ${engine?.units.length >= 15 ? 'text-orange-400' : 'text-green-400'}`}>
          {engine?.units.length || 0}/{TOTAL_MAX_UNITS}
        </span>
      </div>
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';