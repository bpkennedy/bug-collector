"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Map from '@/components/Map';
import BugCollection from '@/components/BugCollection';
import BattleScreen from '@/components/BattleScreen';
import Inventory from '@/components/Inventory';

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
  isGlowBug: boolean;  // New property for Glow Centipedes and Glow Spiders
}

interface Player {
  endurance: number;
  viciousness: number;
  inventory: string[];
}

interface GameState {
  caughtBugs: Bug[];
  mapBugs: Bug[];
  player: Player;
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
  const bugTypes = ['Butterfly', 'Beetle', 'Ladybug', 'Mantis', 'Ant', 'Glow Centipede', 'Glow Spider'];
  const bugs: Bug[] = [];

  // First, generate at least two gnats
  for (let i = 0; i < 2; i++) {
    bugs.push({
      id: generateUniqueId(),
      name: 'Gnat',
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      endurance: 100,
      isKing: false,
      isGnat: true,
      isGlowBug: false,
    });
  }

  // Then generate the rest of the bugs
  for (let i = 2; i < bugCount; i++) {
    const randomValue = Math.random();
    let bugType, isKing, isGnat, isGlowBug, endurance;

    if (randomValue < 0.1) { // 10% chance for Gnat
      bugType = 'Gnat';
      isKing = false;
      isGnat = true;
      isGlowBug = false;
      endurance = 100;
    } else if (randomValue < 0.25) { // 15% chance for a King bug
      bugType = bugTypes[Math.floor(Math.random() * 5)]; // Only regular bugs can be kings
      isKing = true;
      isGnat = false;
      isGlowBug = false;
      endurance = Math.floor(Math.random() * 101) + 100;
    } else if (randomValue < 0.4) { // 15% chance for Glow bugs
      bugType = Math.random() < 0.5 ? 'Glow Centipede' : 'Glow Spider';
      isKing = false;
      isGnat = false;
      isGlowBug = true;
      endurance = Math.floor(Math.random() * 126) + 75; // 75-200 endurance
    } else { // 60% chance for a regular bug
      bugType = bugTypes[Math.floor(Math.random() * 5)]; // Only choose from first 5 bug types
      isKing = false;
      isGnat = false;
      isGlowBug = false;
      endurance = Math.floor(Math.random() * 101);
    }

    bugs.push({
      id: generateUniqueId(),
      name: `${isKing ? 'King ' : ''}${bugType}`,
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      endurance,
      isKing,
      isGnat,
      isGlowBug,
    });
  }

  return bugs;
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

export default function Home() {
  const [caughtBugs, setCaughtBugs] = useState<Bug[]>([]);
  const [mapBugs, setMapBugs] = useState<Bug[]>([]);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [player, setPlayer] = useState<Player>({ endurance: 100, viciousness: 50, inventory: [] });
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSaveGame = useCallback((gameState: GameState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      console.log('Saving game state');
      saveGame(gameState);
    }, 1000); // Debounce for 1 second
  }, []);

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
    debouncedSaveGame(gameState);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [caughtBugs, mapBugs, player, mapSize, debouncedSaveGame]);

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
    let newMapBugs: Bug[];
    let newPlayer: Player;

    if (wonBattle) {
      newMapBugs = mapBugs.filter(b => b.id !== selectedBug!.id);
      if (newMapBugs.length < 7) {
        newMapBugs.push({
          ...generateRandomBugs(mapSize.width, mapSize.height)[0],
          id: generateUniqueId()
        });
      }
      
      const gnatWingAdded = selectedBug!.isGnat ? ['gnat wing'] : [];
      newPlayer = {
        ...player,
        endurance: 100,
        viciousness: 50,
        inventory: [...player.inventory, ...gnatWingAdded]
      };

      setCaughtBugs(prev => [...prev, selectedBug!]);
    } else {
      newMapBugs = generateRandomBugs(mapSize.width, mapSize.height);
      newPlayer = {
        ...player,
        endurance: 100,
        viciousness: 50
      };
    }

    setMapBugs(newMapBugs);
    setPlayer(newPlayer);
    setSelectedBug(null);

    // Immediate save after battle
    saveGame({
      caughtBugs: wonBattle ? [...caughtBugs, selectedBug!] : caughtBugs,
      mapBugs: newMapBugs,
      player: newPlayer,
      mapSize,
    });
  };

  const handleNewGame = () => {
    console.log('Starting new game');
    clearGame();
    setCaughtBugs([]);
    setPlayer({ endurance: 100, viciousness: 50, inventory: [] });
    updateMapSize();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <BugCollection bugs={caughtBugs} />
            <Inventory items={player.inventory} />
          </div>
          <Map bugs={mapBugs} setBugs={setMapBugs} onCatchBug={handleCatchBug} mapSize={mapSize} />
        </>
      )}
    </div>
  );
}
