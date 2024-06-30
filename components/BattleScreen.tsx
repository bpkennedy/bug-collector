"use client";
import { useState, useEffect } from 'react';

export default function BattleScreen({ bug, player, setPlayer, onBattleEnd }: any) {
  const [bugEndurance, setBugEndurance] = useState(bug.endurance);
  const [actionLog, setActionLog] = useState<any[]>([]);

  const addToLog = (action: any) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setActionLog(prevLog => [{time: timeString, action}, ...prevLog]);
  };

  const performAction = (action: any) => {
    switch (action) {
      case 'punch':
        setBugEndurance(Math.max(0, bugEndurance - 50));
        setPlayer({ ...player, endurance: Math.max(0, player.endurance - 20) });
        addToLog("Player punched the bug for 50 damage!");
        break;
      case 'taunt':
        setPlayer({ 
          ...player, 
          endurance: Math.min(150, player.endurance + 30),
          viciousness: Math.max(0, player.viciousness - 10)
        });
        addToLog("Player taunted the bug, gaining 30 endurance and losing 10 viciousness.");
        break;
      case 'kick':
        setBugEndurance(Math.max(0, bugEndurance - 20));
        setPlayer({ 
          ...player, 
          viciousness: Math.min(50, player.viciousness + 30)
        });
        addToLog("Player kicked the bug for 20 damage and gained 30 viciousness!");
        break;
    }
    
    // Bug's turn to attack
    setTimeout(() => bugAttack(), 1000);
  };

  const bugAttack = () => {
    if (Math.random() < 0.2) { // 20% chance to miss
      addToLog(`${bug.name} tried to attack but missed!`);
      return;
    }
    
    const damage = Math.floor(Math.random() * 41) + 10; // Random damage between 10-50
    setPlayer((prevPlayer: any) => ({
      ...prevPlayer,
      endurance: Math.max(0, prevPlayer.endurance - damage)
    }));
    addToLog(`${bug.name} attacked the player for ${damage} damage!`);
  };

  useEffect(() => {
    if (bugEndurance === 0) {
      alert(`You won the battle! ${bug.name} has been captured!`);
      onBattleEnd(true);
    } else if (player.endurance === 0) {
      alert(`You lost the battle! ${bug.name} escaped!`);
      onBattleEnd(false);
    }
  }, [bugEndurance, player.endurance]);

  return (
    <div className="battle-screen">
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
      <div className="flex space-x-2 mb-4">
        <button onClick={() => performAction('punch')} className="bg-blue-500 text-white px-4 py-2 rounded">Punch</button>
        <button onClick={() => performAction('taunt')} className="bg-yellow-500 text-white px-4 py-2 rounded">Taunt</button>
        <button onClick={() => performAction('kick')} className="bg-green-500 text-white px-4 py-2 rounded">Kick</button>
      </div>
      <div className="action-log h-64 overflow-y-auto border border-gray-300 p-2">
        <h3 className="font-semibold mb-2">Action Log</h3>
        {actionLog.map((entry, index) => (
          <p key={index} className="text-sm">
            <span className="font-semibold">{entry.time}</span>: {entry.action}
          </p>
        ))}
      </div>
    </div>
  );
}
