import { type UnitType } from '../engine/config/units';
import { type GameState } from '../store/gameStore';

export interface SaveSlot {
  id: string;
  name: string;
  data: SaveData;
  createdAt: number;
  updatedAt: number;
}

export interface SaveData {
  resources: number;
  baseHp: number;
  wave: number;
  unitCounts: Record<UnitType, number>;
  units: Array<{ type: UnitType; hexQ: number; hexR: number }>;
  upgrades: {
    damage: { level: number; cost: number; effect: number };
    hp: { level: number; cost: number; effect: number };
    resource: { level: number; cost: number; effect: number };
  };
  version: string;
}

const SAVE_VERSION = '1.0.0';
const SAVES_KEY = 'tower_defense_saves';

class SaveManagerClass {
  public getAllSaves(): SaveSlot[] {
    const raw = localStorage.getItem(SAVES_KEY);
    if (!raw) return [];
    
    try {
      const saves: SaveSlot[] = JSON.parse(raw);
      return saves.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }
  
  public save(gameState: GameState, slotId?: string, slotName?: string): string {
    const saves = this.getAllSaves();
    const unitsData = gameState.unitsPositions || [];
    
    const saveData: SaveData = {
      resources: gameState.resources,
      baseHp: gameState.baseHp,
      wave: gameState.wave,
      unitCounts: gameState.unitCounts,
      units: unitsData,
      upgrades: {
        damage: gameState.unitDamageUpgrade,
        hp: gameState.unitHpUpgrade,
        resource: gameState.resourceGainUpgrade
      },
      version: SAVE_VERSION
    };
    
    let slot: SaveSlot;
    
    if (slotId) {
      const existingIndex = saves.findIndex(s => s.id === slotId);
      if (existingIndex !== -1) {
        slot = {
          ...saves[existingIndex],
          data: saveData,
          updatedAt: Date.now()
        };
        saves[existingIndex] = slot;
      } else {
        slot = this.createNewSlot(saveData, slotName);
        saves.push(slot);
      }
    } else {
      slot = this.createNewSlot(saveData, slotName);
      saves.push(slot);
    }
    
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    return slot.id;
  }
  
  private createNewSlot(saveData: SaveData, slotName?: string): SaveSlot {
    const now = Date.now();
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      name: slotName || `Сохранение ${new Date(now).toLocaleString()}`,
      data: saveData,
      createdAt: now,
      updatedAt: now
    };
  }
  
  public load(slotId: string): SaveData | null {
    const saves = this.getAllSaves();
    const slot = saves.find(s => s.id === slotId);
    if (slot) {
      return slot.data;
    }
    return null;
  }
  
  public deleteSave(slotId: string): void {
    const saves = this.getAllSaves();
    const filtered = saves.filter(s => s.id !== slotId);
    localStorage.setItem(SAVES_KEY, JSON.stringify(filtered));
  }
  
  public getSaveById(slotId: string): SaveSlot | null {
    const saves = this.getAllSaves();
    return saves.find(s => s.id === slotId) || null;
  }
  
  public renameSave(slotId: string, newName: string): boolean {
    const saves = this.getAllSaves();
    const slot = saves.find(s => s.id === slotId);
    
    if (slot) {
      slot.name = newName;
      slot.updatedAt = Date.now();
      localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
      return true;
    }
    
    return false;
  }
  
  public hasSaves(): boolean {
    return this.getAllSaves().length > 0;
  }
}

export const SaveManager = new SaveManagerClass();