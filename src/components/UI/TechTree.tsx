import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export const TechTree: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    resources, 
    unitDamageUpgrade, 
    unitHpUpgrade, 
    resourceGainUpgrade,
    upgradeUnitDamage,
    upgradeUnitHp,
    upgradeResourceGain
  } = useGameStore();
  
  const upgrades = [
    {
      id: 'damage',
      name: '⚔️ Сила атаки',
      desc: 'Увеличивает урон всех юнитов на 20%',
      upgrade: upgradeUnitDamage,
      level: unitDamageUpgrade.level,
      cost: unitDamageUpgrade.cost,
      effect: unitDamageUpgrade.effect,
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 'hp',
      name: '🛡️ Живучесть',
      desc: 'Увеличивает HP всех юнитов на 15%',
      upgrade: upgradeUnitHp,
      level: unitHpUpgrade.level,
      cost: unitHpUpgrade.cost,
      effect: unitHpUpgrade.effect,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'resource',
      name: '💰 Добыча',
      desc: 'Увеличивает получаемые ресурсы на 25%',
      upgrade: upgradeResourceGain,
      level: resourceGainUpgrade.level,
      cost: resourceGainUpgrade.cost,
      effect: resourceGainUpgrade.effect,
      color: 'from-yellow-600 to-amber-600'
    }
  ];
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 bg-purple-700 text-white px-4 py-3 rounded-full shadow-lg active:scale-95 transition-transform z-50"
      >
        🌳 {isOpen ? '✖' : 'Древо'}
      </button>
      
      {isOpen && (
        <div className="fixed bottom-32 right-4 w-72 bg-black/95 backdrop-blur-lg rounded-xl border border-purple-500/50 shadow-2xl z-50 animate-fadeIn">
          <div className="p-4 border-b border-purple-500/30">
            <h3 className="text-white font-bold text-lg">🌳 Древо развития</h3>
            <p className="text-gray-400 text-xs">Улучшай свою армию</p>
          </div>
          
          <div className="p-4 space-y-3">
            {upgrades.map((up) => (
              <div key={up.id} className="bg-black/50 rounded-lg p-3 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-bold text-sm">{up.name}</div>
                    <div className="text-gray-400 text-xs">{up.desc}</div>
                  </div>
                  <div className="text-purple-400 text-xs font-bold">Lv.{up.level}</div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-yellow-400 text-sm">
                    {up.level > 0 ? `x${up.effect.toFixed(1)}` : 'x1.0'}
                  </div>
                  <button
                    onClick={() => up.upgrade()}
                    disabled={resources < up.cost}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-bold transition-all
                      ${resources >= up.cost 
                        ? `bg-gradient-to-r ${up.color} hover:scale-105 active:scale-95` 
                        : 'bg-gray-600 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {up.cost}💰
                  </button>
                </div>
                
                <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${Math.min(100, up.level * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-purple-500/30 text-center text-gray-500 text-xs">
            💡 Улучшения применяются к новым юнитам
          </div>
        </div>
      )}
    </>
  );
};