import { useState, useCallback } from 'react';
import { GameEngine } from '../../engine/GameEngine';

export const useHoverHex = (engine: GameEngine | null) => {
  const [hoverHex, setHoverHex] = useState<{ q: number; r: number; x: number; y: number } | null>(null);

  const updateHoverHex = useCallback((mouseX: number, mouseY: number) => {
    if (!engine) {
      setHoverHex(null);
      return;
    }
    
    const hexAtPos = engine.getHexAtPixel(mouseX, mouseY);
    setHoverHex(hexAtPos);
  }, [engine]);

  const clearHoverHex = useCallback(() => {
    setHoverHex(null);
  }, []);

  return { hoverHex, updateHoverHex, clearHoverHex };
};