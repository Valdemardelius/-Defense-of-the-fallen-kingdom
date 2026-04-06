import { useEffect } from 'react';
import { GameEngine } from '../../engine/GameEngine';

export const useHighlight = (
  engine: GameEngine | null,
  hoverHex: { q: number; r: number; x: number; y: number } | null,
  selectedUnitType: string | null
) => {
  useEffect(() => {
    if (!engine || !hoverHex || !selectedUnitType) return;
    
    let frameId: number;
    
    const drawHighlight = () => {
      if (engine && hoverHex) {
        engine.drawHighlight(hoverHex.q, hoverHex.r);
      }
      frameId = requestAnimationFrame(drawHighlight);
    };
    
    frameId = requestAnimationFrame(drawHighlight);
    return () => cancelAnimationFrame(frameId);
  }, [engine, hoverHex, selectedUnitType]);
};