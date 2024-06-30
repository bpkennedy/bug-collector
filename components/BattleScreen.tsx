import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Bug {
  id: string;
  name: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  endurance: number;
  isKing: boolean;
  isGnat: boolean;
  isGlowBug: boolean;
  isStag: boolean; // New property for Stag Beetle
}

interface Player {
  endurance: number;
  viciousness: number;
  inventory: string[];
}

interface BattleScreenProps {
  bug: Bug;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  onBattleEnd: (wonBattle: boolean) => void;
}

export default function BattleScreen({ bug, player, setPlayer, onBattleEnd }: BattleScreenProps) {
  const [bugEndurance, setBugEndurance] = useState(bug.endurance);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const battleEndedRef = useRef(false);

  const addToLog = useCallback((action: string) => {
    setActionLog(prevLog => [action, ...prevLog]);
  }, []);

  const endBattle = useCallback((wonBattle: boolean) => {
    if (battleEndedRef.current) return;
    battleEndedRef.current = true;
    
    const message = wonBattle
      ? `Congratulations! You won the battle! ${bug.name} has been captured!`
      : `Oh no! You lost the battle! ${bug.name} escaped!`;
    
    addToLog(message);
    setTimeout(() => {
      alert(message);
      onBattleEnd(wonBattle);
    }, 100);
  }, [bug.name, onBattleEnd, addToLog]);

  const bugAttack = useCallback(() => {
    if (battleEndedRef.current) return;
    
    let damage;
    if (bug.isStag) {
      // Stag Beetle never misses
      if (Math.random() < 0.3) { // 30% chance for 15 damage
        damage = 15;
      } else { // 70% chance for 50-60 damage
        damage = Math.floor(Math.random() * 11) + 50;
      }
    } else {
      if (Math.random() < 0.2) { // 20% chance to miss for other bugs
        addToLog(`${bug.name} tried to attack but missed!`);
        setIsBlocking(false);
        return;
      }
      
      if (bug.isKing) {
        damage = Math.floor(Math.random() * 41) + 30; // 30-70 damage
      } else if (bug.isGlowBug) {
        damage = Math.floor(Math.random() * 21) + 10; // 10-30 damage
      } else {
        damage = Math.floor(Math.random() * 41) + 10; // 10-50 damage
      }
    }

    const actualDamage = isBlocking ? Math.floor(damage / 2) : damage;
    
    setPlayer(prevPlayer => {
      const newEndurance = Math.max(0, prevPlayer.endurance - actualDamage);
      if (newEndurance === 0) {
        endBattle(false);
      }
      return { ...prevPlayer, endurance: newEndurance };
    });
    
    addToLog(`${bug.name} attacked the player for ${actualDamage} damage!${isBlocking ? ' (Blocked)' : ''}`);
    setIsBlocking(false);
  }, [bug.name, bug.isKing, bug.isGlowBug, bug.isStag, isBlocking, addToLog, setPlayer, endBattle]);

  const performAction = useCallback((action: string) => {
    if (battleEndedRef.current) return;
    
    switch (action) {
      case 'punch':
        setBugEndurance(prev => {
          const newEndurance = Math.max(0, prev - 50);
          if (newEndurance === 0) {
            endBattle(true);
          }
          return newEndurance;
        });
        setPlayer(prev => ({ ...prev, endurance: Math.max(0, prev.endurance - 20) }));
        addToLog("Player punched the bug for 50 damage!");
        break;
      case 'kick':
        setBugEndurance(prev => {
          const newEndurance = Math.max(0, prev - 20);
          if (newEndurance === 0) {
            endBattle(true);
          }
          return newEndurance;
        });
        setPlayer(prev => ({ 
          ...prev, 
          viciousness: Math.min(50, prev.viciousness + 30)
        }));
        addToLog("Player kicked the bug for 20 damage and gained 30 viciousness!");
        break;
      case 'taunt':
        setPlayer(prev => ({ 
          ...prev, 
          endurance: Math.min(150, prev.endurance + 30),
          viciousness: Math.max(0, prev.viciousness - 10)
        }));
        addToLog("Player taunted the bug, gaining 30 endurance and losing 10 viciousness.");
        break;
      case 'block':
        setIsBlocking(true);
        addToLog("Player is blocking the next attack!");
        break;
      case 'skip':
        addToLog("Player skipped their turn.");
        break;
      case 'retreat':
        onBattleEnd(false);
        return;
      case 'useItem':
        setShowInventory(prev => !prev);
        return;
    }
    
    if (!battleEndedRef.current) {
      setTimeout(() => bugAttack(), 1000);
    }
  }, [bugAttack, addToLog, endBattle, setPlayer, onBattleEnd]);

  const handleItemUse = useCallback((item: string) => {
    if (battleEndedRef.current) return;
    
    if (item === 'gnat wing') {
      setPlayer(prev => {
        const inventoryIndex = prev.inventory.indexOf('gnat wing');
        if (inventoryIndex === -1) return prev; // No gnat wing found
  
        const newInventory = [
          ...prev.inventory.slice(0, inventoryIndex),
          ...prev.inventory.slice(inventoryIndex + 1)
        ];
  
        return {
          ...prev,
          endurance: 150,
          inventory: newInventory
        };
      });
  
      addToLog("Player used a gnat wing and restored endurance to 150!");
    } else if (item === 'stag horn') {
      setPlayer(prev => {
        const inventoryIndex = prev.inventory.indexOf('stag horn');
        if (inventoryIndex === -1) return prev; // No stag horn found
  
        const newInventory = [
          ...prev.inventory.slice(0, inventoryIndex),
          ...prev.inventory.slice(inventoryIndex + 1)
        ];
  
        return {
          ...prev,
          viciousness: 50,
          inventory: newInventory
        };
      });
  
      addToLog("Player used a stag horn and set viciousness to 50!");
    }
  
    setShowInventory(false);
    setTimeout(() => bugAttack(), 1000);
  }, [bugAttack, addToLog, setPlayer, setShowInventory]);

  useEffect(() => {
    if (bugEndurance === 0 && !battleEndedRef.current) {
      endBattle(true);
    } else if (player.endurance === 0 && !battleEndedRef.current) {
      endBattle(false);
    }
  }, [bugEndurance, player.endurance, endBattle]);

  return (
    <div className="battle-screen p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Battle Screen</h2>
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-semibold">Player</h3>
          <p>Endurance: {player.endurance}</p>
          <p>Viciousness: {player.viciousness}</p>
        </div>
        <div>
          <h3 className="font-semibold">{bug.name}</h3>
          <p>Endurance: {bugEndurance}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button onClick={() => performAction('punch')} className="bg-red-500 text-white px-4 py-2 rounded">Punch</button>
        <button onClick={() => performAction('kick')} className="bg-red-500 text-white px-4 py-2 rounded">Kick</button>
        <button onClick={() => performAction('taunt')} className="bg-yellow-500 text-white px-4 py-2 rounded">Taunt</button>
        <button onClick={() => performAction('block')} className="bg-blue-500 text-white px-4 py-2 rounded">Block</button>
        <button onClick={() => performAction('skip')} className="bg-blue-500 text-white px-4 py-2 rounded">Skip</button>
        <button onClick={() => performAction('retreat')} className="bg-purple-500 text-white px-4 py-2 rounded">Retreat</button>
        <button onClick={() => performAction('useItem')} className="bg-gray-500 text-white px-4 py-2 rounded">Use Item</button>
      </div>
      {showInventory && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Inventory</h3>
          {player.inventory.length === 0 ? (
            <p>No items in inventory</p>
          ) : (
            player.inventory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemUse(item)}
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2 mb-2"
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}
      <div className="action-log h-64 overflow-y-auto border border-gray-300 p-2 bg-white rounded">
        <h3 className="font-semibold mb-2">Action Log</h3>
        {actionLog.map((entry, index) => (
          <p key={index} className="text-sm mb-1">
            {entry}
          </p>
        ))}
      </div>
    </div>
  );
}
