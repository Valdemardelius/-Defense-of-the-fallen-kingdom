import React, { useState } from 'react';
import type { SaveSlot as SaveSlotType } from '../../../lib/saveManager';

interface SaveSlotProps {
  slot: SaveSlotType;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const SaveSlot: React.FC<SaveSlotProps> = ({ slot, onLoad, onDelete, onRename }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(slot.name);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleRename = () => {
    if (renameValue.trim()) {
      onRename(slot.id, renameValue);
    }
    setIsRenaming(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      {isRenaming ? (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <button onClick={handleRename} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            ✅
          </button>
          <button onClick={() => setIsRenaming(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
            ❌
          </button>
        </div>
      ) : (
        <div className="font-bold text-white mb-1">{slot.name}</div>
      )}
      
      <div className="text-gray-400 text-xs mb-2">
        📅 {formatDate(slot.updatedAt)}
      </div>
      
      <div className="text-gray-500 text-xs mb-3">
        🌊 Волна {slot.data.wave} | 💰 {slot.data.resources} | ❤️ {slot.data.baseHp}
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => onLoad(slot.id)} className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition">
          📀 Загрузить
        </button>
        {!isRenaming && (
          <button onClick={() => setIsRenaming(true)} className="bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition">
            ✏️ Переименовать
          </button>
        )}
        <button onClick={() => onDelete(slot.id)} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
};