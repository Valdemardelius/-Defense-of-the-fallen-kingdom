import { create } from 'zustand';

interface GameState {
  resources: number;
  baseHp: number;
  wave: number;
  addResources: (amount: number) => void;
  spendResources: (amount: number) => boolean;
  damageBase: (damage: number) => void;
  nextWave: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  resources: 200,
  baseHp: 1000,
  wave: 0,
  
  addResources: (amount: number) => {
    set((state) => ({ resources: state.resources + amount }));
  },
  
  spendResources: (amount: number) => {
    const { resources } = get();
    if (resources >= amount) {
      set((state) => ({ resources: state.resources - amount }));
      return true;
    }
    return false;
  },
  
  damageBase: (damage: number) => {
    set((state) => ({ baseHp: Math.max(0, state.baseHp - damage) }));
  },
  
  nextWave: () => {
    set((state) => ({ wave: state.wave + 1 }));
  }
}));