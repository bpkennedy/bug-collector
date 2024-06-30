"use client";
import { useState, useEffect, useCallback } from 'react';
import Map from '@/components/Map';
import BugCollection from '@/components/BugCollection';
import BattleScreen from '@/components/BattleScreen';

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

interface GameState {
  caughtBugs: Bug[];
  mapBugs: Bug[];
  player: {
    endurance: number;
    viciousness: number;
  };
  mapSize: {
    width: number;
    height: number;
  };
}

const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateRandomBugs = (width: number, height: number): Bug[] => {
  const bugCount = Math.floor(Math.random() * 9) + 7; // 7 to 15 bugs
  const bugTypes = ['Butterfly', 'Beetle', 'Ladybug', 'Mantis', 'Ant'];
  return Array.from({ length: bugCount }, () => {
    const isKing = Math.random() < 0.2; // 20% chance of being a king bug
    return {
      id: generateUniqueId(),  // Use the new function here
      name: `${isKing ? 'King ' : ''}${bugTypes[Math.floor(Math.random() * bugTypes.length)]}`,
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 2, // Random speed in x direction
      dy: (Math.random() - 0.5) * 2, // Random speed in y direction
      endurance: isKing ? Math.floor(Math.random() * 101) + 100 : Math.floor(Math.random() * 101),
      isKing: isKing,
    };
  });
};

const saveGame = (gameState: GameState) => {
  console.log('Saving game state');
  localStorage.setItem('bugCatcherGameState', JSON.stringify(gameState));
};

const loadGame = (): GameState | null => {
  console.log('Loading game state');
  const savedState = localStorage.getItem('bugCatcherGameState');
  return savedState ? JSON.parse(savedState) : null;
};

const clearGame = () => {
  console.log('Clearing game state');
  localStorage.removeItem('bugCatcherGameState');
};

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function Home() {
  const [caughtBugs, setCaughtBugs] = useState<Bug[]>([]);
  const [mapBugs, setMapBugs] = useState<Bug[]>([]);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [player, setPlayer] = useState({ endurance: 100, viciousness: 50 });
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((gameState: GameState) => saveGame(gameState), 1000),
    []
  );

  const saveGameState = useCallback(() => {
    const gameState: GameState = {
      caughtBugs,
      mapBugs,
      player,
      mapSize,
    };
    saveGame(gameState);
  }, [caughtBugs, mapBugs, player, mapSize]);

  useEffect(() => {
    console.log('Initial load');
    const savedState = loadGame();
    if (savedState) {
      console.log('Loaded saved state');
      setCaughtBugs(savedState.caughtBugs);
      setMapBugs(savedState.mapBugs);
      setPlayer(savedState.player);
      setMapSize(savedState.mapSize);
    } else {
      console.log('No saved state found, initializing new game');
      updateMapSize();
    }
  }, []);

  useEffect(() => {
    const gameState: GameState = {
      caughtBugs,
      mapBugs,
      player,
      mapSize,
    };
    debouncedSave(gameState);
  }, [caughtBugs, mapBugs, player, mapSize, debouncedSave]);

  const updateMapSize = useCallback(() => {
    console.log('Updating map size');
    const mapElement = document.getElementById('bug-map');
    if (mapElement) {
      const newMapSize = { 
        width: mapElement.offsetWidth, 
        height: mapElement.offsetHeight 
      };
      setMapSize(newMapSize);
      if (mapBugs.length === 0) {
        console.log('Generating initial bugs');
        setMapBugs(generateRandomBugs(newMapSize.width, newMapSize.height));
      }
    }
  }, [mapBugs.length]);

  useEffect(() => {
    window.addEventListener('resize', updateMapSize);
    return () => window.removeEventListener('resize', updateMapSize);
  }, [updateMapSize]);

  const handleCatchBug = (bug: Bug) => {
    console.log('Catching bug:', bug.name);
    setSelectedBug(bug);
  };

  const handleBattleEnd = (wonBattle: boolean) => {
    console.log('Battle ended, won:', wonBattle);
    if (wonBattle) {
      setCaughtBugs(prev => {
        const newCaughtBugs = [...prev, selectedBug!];
        setMapBugs(prevBugs => {
          const newMapBugs = prevBugs.filter(b => b.id !== selectedBug!.id);
          if (newMapBugs.length < 7) {
            newMapBugs.push({
              ...generateRandomBugs(mapSize.width, mapSize.height)[0],
              id: generateUniqueId()
            });
          }
          // Immediate save after updating both caughtBugs and mapBugs
          saveGame({
            caughtBugs: newCaughtBugs,
            mapBugs: newMapBugs,
            player: { endurance: 100, viciousness: 50 },
            mapSize,
          });
          return newMapBugs;
        });
        return newCaughtBugs;
      });
    } else {
      const newMapBugs = generateRandomBugs(mapSize.width, mapSize.height);
      setMapBugs(newMapBugs);
      // Immediate save after losing a battle
      saveGame({
        caughtBugs,
        mapBugs: newMapBugs,
        player: { endurance: 100, viciousness: 50 },
        mapSize,
      });
    }
    setSelectedBug(null);
    setPlayer({ endurance: 100, viciousness: 50 });
  };

  const handleNewGame = () => {
    console.log('Starting new game');
    clearGame();
    setCaughtBugs([]);
    setPlayer({ endurance: 100, viciousness: 50 });
    updateMapSize();
    // Immediate save after starting a new game
    saveGameState();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bug Catcher Game</h1>
      <button 
        onClick={handleNewGame}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        New Game
      </button>
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
          <Map bugs={mapBugs} setBugs={setMapBugs} onCatchBug={handleCatchBug} mapSize={mapSize} />
        </>
      )}
    </div>
  );
}
