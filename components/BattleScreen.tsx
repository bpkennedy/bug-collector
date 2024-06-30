"use client";
import { useState, useEffect } from 'react';

interface Bug {
  id: string;  // Change this to string
  name: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  endurance: number;
  isKing: boolean;
}

interface Player {
  endurance: number;
  viciousness: number;
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
  const [battleEnded, setBattleEnded] = useState(false);

  const addToLog = (action: string) => {
    setActionLog(prevLog => [action, ...prevLog]);
  };

  const performAction = (action: string) => {
    if (battleEnded) return;

    switch (action) {
      case 'punch':
        setBugEndurance(Math.max(0, bugEndurance - 50));
        setPlayer({ ...player, endurance: Math.max(0, player.endurance - 20) });
        addToLog("Player punched the bug for 50 damage!");
        break;
      case 'kick':
        setBugEndurance(Math.max(0, bugEndurance - 20));
        setPlayer({ 
          ...player, 
          viciousness: Math.min(50, player.viciousness + 30)
        });
        addToLog("Player kicked the bug for 20 damage and gained 30 viciousness!");
        break;
      case 'taunt':
        setPlayer({ 
          ...player, 
          endurance: Math.min(150, player.endurance + 30),
          viciousness: Math.max(0, player.viciousness - 10)
        });
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
        setBattleEnded(true);
        onBattleEnd(false);
        return;
    }
    
    // Bug's turn to attack
    setTimeout(() => bugAttack(), 1000);
  };

  const bugAttack = () => {
    if (battleEnded) return;

    if (Math.random() < 0.2) { // 20% chance to miss
      addToLog(`${bug.name} tried to attack but missed!`);
      setIsBlocking(false);
      return;
    }
    
    const baseDamage = bug.isKing ? Math.floor(Math.random() * 41) + 30 : Math.floor(Math.random() * 41) + 10;
    const actualDamage = isBlocking ? Math.floor(baseDamage / 2) : baseDamage;
    
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      endurance: Math.max(0, prevPlayer.endurance - actualDamage)
    }));
    
    addToLog(`${bug.name} attacked the player for ${actualDamage} damage!${isBlocking ? ' (Blocked)' : ''}`);
    setIsBlocking(false);
  };

  useEffect(() => {
    if (battleEnded) return;

    if (bugEndurance === 0) {
      setBattleEnded(true);
      addToLog(`You won the battle! ${bug.name} has been captured!`);
      setTimeout(() => {
        alert(`Congratulations! You won the battle! ${bug.name} has been captured!`);
        onBattleEnd(true);
      }, 1000);
    } else if (player.endurance === 0) {
      setBattleEnded(true);
      addToLog(`You lost the battle! ${bug.name} escaped!`);
      setTimeout(() => {
        alert(`Oh no! You lost the battle! ${bug.name} escaped!`);
        onBattleEnd(false);
      }, 1000);
    }
  }, [bugEndurance, player.endurance, bug.name, onBattleEnd, battleEnded]);

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
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={() => performAction('punch')} className="bg-red-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Punch</button>
        <button onClick={() => performAction('kick')} className="bg-red-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Kick</button>
        <button onClick={() => performAction('taunt')} className="bg-yellow-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Taunt</button>
        <button onClick={() => performAction('block')} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Block</button>
        <button onClick={() => performAction('skip')} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Skip</button>
        <button onClick={() => performAction('retreat')} className="bg-purple-500 text-white px-4 py-2 rounded" disabled={battleEnded}>Retreat</button>
      </div>
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
