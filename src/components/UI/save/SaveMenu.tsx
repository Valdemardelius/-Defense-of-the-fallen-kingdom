import React, { useState, useEffect } from 'react';
import { SaveManager } from '../../../lib/SaveManager';
import type { SaveSlot as SaveSlotType } from '../../../lib/SaveManager';
import { useGameStore } from '../../../store/gameStore';
import { SaveSlot } from './SaveSlot';
import { SaveForm } from './SaveForm';
import { SaveEmpty } from './SaveEmpty';

export const SaveMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [saves, setSaves] = useState<SaveSlotType[]>([]);
  const gameState = useGameStore();

  const refreshSaves = () => {
    setSaves(SaveManager.getAllSaves());
  };

  useEffect(() => {
    if (isOpen) {
      refreshSaves();
    }
  }, [isOpen]);

  const handleSave = (name: string) => {
    const state = useGameStore.getState();
    const unitsData = state.unitsPositions || [];
    
    const saveState = {
      ...state,
      unitsPositions: unitsData
    };
    
    SaveManager.save(saveState, undefined, name);
    refreshSaves();
    alert('💾 Игра сохранена!');
  };

  const handleLoad = (id: string) => {
    const saveData = SaveManager.load(id);
    if (saveData) {
      gameState.loadFromSave(saveData);
      setIsOpen(false);
      alert('📀 Игра загружена!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить сохранение?')) {
      SaveManager.deleteSave(id);
      refreshSaves();
    }
  };

  const handleRename = (id: string, newName: string) => {
    SaveManager.renameSave(id, newName);
    refreshSaves();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition z-50"
      >
        💾 Сохранения
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-gray-900 rounded-xl w-[500px] max-w-[90vw] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">💾 Управление сохранениями</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xl">✖</button>
            </div>

            <div className="p-4 border-b border-gray-700">
              <SaveForm onSave={handleSave} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {saves.length === 0 ? (
                <SaveEmpty />
              ) : (
                <div className="space-y-2">
                  {saves.map((slot) => (
                    <SaveSlot
                      key={slot.id}
                      slot={slot}
                      onLoad={handleLoad}
                      onDelete={handleDelete}
                      onRename={handleRename}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 text-gray-500 text-xs text-center">
              Сохраняется: ресурсы, волна, улучшения, позиции юнитов
            </div>
          </div>
        </div>
      )}
    </>
  );
};