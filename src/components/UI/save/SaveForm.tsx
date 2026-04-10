import React, { useState } from 'react';

interface SaveFormProps {
  onSave: (name: string) => void;
}

export const SaveForm: React.FC<SaveFormProps> = ({ onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name);
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Название сохранения"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition"
      >
        💾 Сохранить
      </button>
    </form>
  );
};