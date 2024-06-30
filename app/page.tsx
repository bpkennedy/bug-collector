"use client";
import { useState, useEffect } from 'react';
import Map from '@/components/Map';
import BugCollection from '@/components/BugCollection';
import BattleScreen from '@/components/BattleScreen';

export default function Home() {
  const [caughtBugs, setCaughtBugs] = useState<any[]>([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [player, setPlayer] = useState({ endurance: 100, viciousness: 50 });

  const handleCatchBug = (bug: any) => {
    setSelectedBug(bug);
  };

  const handleBattleEnd = (wonBattle: any) => {
    if (wonBattle) {
      setCaughtBugs([...caughtBugs, selectedBug]);
    }
    setSelectedBug(null);
    setPlayer({ endurance: 150, viciousness: 50 });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bug Catcher Game</h1>
      {selectedBug ? (
        <BattleScreen 
          bug={selectedBug} 
          player={player} 
          setPlayer={setPlayer}
          onBattleEnd={handleBattleEnd} 
        />
      ) : (
        <>
          <BugCollection bugs={caughtBugs} />
          <Map onCatchBug={handleCatchBug} />
        </>
      )}
    </div>
  );
}
