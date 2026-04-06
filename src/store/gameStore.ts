import { create } from 'zustand';
import { type UnitType } from '../engine/config/units';

interface Upgrade {
  level: number;
  cost: number;
  effect: number;
}

interface GameState {
  resources: number;
  baseHp: number;
  wave: number;
  unitCounts: Record<UnitType, number>;
  unitDamageUpgrade: Upgrade;
  unitHpUpgrade: Upgrade;
  resourceGainUpgrade: Upgrade;
  addResources: (amount: number) => void;
  spendResources: (amount: number) => boolean;
  damageBase: (damage: number) => void;
  setWave: (wave: number) => void;
  setUnitCounts: (counts: Record<UnitType, number>) => void;
  upgradeUnitDamage: () => boolean;
  upgradeUnitHp: () => boolean;
  upgradeResourceGain: () => boolean;
  getUnitDamageBonus: () => number;
  getUnitHpBonus: () => number;
  getResourceGainBonus: () => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  resources: 200,
  baseHp: 1000,
  wave: 1,
  unitCounts: { melee: 0, ranged: 0, tank: 0 },
  
  unitDamageUpgrade: { level: 0, cost: 100, effect: 1.0 },
  unitHpUpgrade: { level: 0, cost: 80, effect: 1.0 },
  resourceGainUpgrade: { level: 0, cost: 120, effect: 1.0 },
  
  addResources: (amount: number) => {
    const bonus = get().getResourceGainBonus();
    set((state) => ({ resources: state.resources + Math.floor(amount * bonus) }));
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
  
  setWave: (wave: number) => {
    set({ wave });
  },
  
  setUnitCounts: (counts: Record<UnitType, number>) => {
    set({ unitCounts: counts });
  },
  
  upgradeUnitDamage: () => {
    const { unitDamageUpgrade, resources, spendResources } = get();
    if (resources >= unitDamageUpgrade.cost) {
      if (spendResources(unitDamageUpgrade.cost)) {
        set({
          unitDamageUpgrade: {
            level: unitDamageUpgrade.level + 1,
            cost: Math.floor(unitDamageUpgrade.cost * 1.6),
            effect: unitDamageUpgrade.effect + 0.2
          }
        });
        return true;
      }
    }
    return false;
  },
  
  upgradeUnitHp: () => {
    const { unitHpUpgrade, resources, spendResources } = get();
    if (resources >= unitHpUpgrade.cost) {
      if (spendResources(unitHpUpgrade.cost)) {
        set({
          unitHpUpgrade: {
            level: unitHpUpgrade.level + 1,
            cost: Math.floor(unitHpUpgrade.cost * 1.5),
            effect: unitHpUpgrade.effect + 0.15
          }
        });
        return true;
      }
    }
    return false;
  },
  
  upgradeResourceGain: () => {
    const { resourceGainUpgrade, resources, spendResources } = get();
    if (resources >= resourceGainUpgrade.cost) {
      if (spendResources(resourceGainUpgrade.cost)) {
        set({
          resourceGainUpgrade: {
            level: resourceGainUpgrade.level + 1,
            cost: Math.floor(resourceGainUpgrade.cost * 1.7),
            effect: resourceGainUpgrade.effect + 0.25
          }
        });
        return true;
      }
    }
    return false;
  },
  
  getUnitDamageBonus: () => {
    return get().unitDamageUpgrade.effect;
  },
  
  getUnitHpBonus: () => {
    return get().unitHpUpgrade.effect;
  },
  
  getResourceGainBonus: () => {
    return get().resourceGainUpgrade.effect;
  }
}));