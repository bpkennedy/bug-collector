"use client";
import { useState, useEffect, useCallback } from 'react';

interface Bug {
  id: number;
  name: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  endurance: number;
  isKing: boolean;
}

interface MapProps {
  onCatchBug: (bug: Bug) => void;
}

const bugTypes = ['Butterfly', 'Beetle', 'Ladybug', 'Mantis', 'Ant'];

const generateRandomBugs = (width: number, height: number): Bug[] => {
  const bugCount = Math.floor(Math.random() * 9) + 7; // 7 to 15 bugs
  return Array.from({ length: bugCount }, (_, i) => {
    const isKing = Math.random() < 0.2; // 20% chance of being a king bug
    return {
      id: i + 1,
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

export default function Map({ onCatchBug }: MapProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const updateMapSize = useCallback(() => {
    const mapElement = document.getElementById('bug-map');
    if (mapElement) {
      setMapSize({ 
        width: mapElement.offsetWidth, 
        height: mapElement.offsetHeight 
      });
    }
  }, []);

  useEffect(() => {
    updateMapSize();
    window.addEventListener('resize', updateMapSize);
    return () => window.removeEventListener('resize', updateMapSize);
  }, [updateMapSize]);

  useEffect(() => {
    if (mapSize.width > 0 && mapSize.height > 0) {
      setBugs(generateRandomBugs(mapSize.width, mapSize.height));
    }
  }, [mapSize]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBugs(prevBugs => prevBugs.map(bug => {
        let newX = bug.x + bug.dx;
        let newY = bug.y + bug.dy;
        let newDx = bug.dx;
        let newDy = bug.dy;

        // Bounce off walls
        if (newX < 0 || newX > mapSize.width) {
          newDx = -newDx;
          newX = Math.max(0, Math.min(newX, mapSize.width));
        }
        if (newY < 0 || newY > mapSize.height) {
          newDy = -newDy;
          newY = Math.max(0, Math.min(newY, mapSize.height));
        }

        return { ...bug, x: newX, y: newY, dx: newDx, dy: newDy };
      }));
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(moveInterval);
  }, [mapSize]);

  const handleCatchBug = (bug: Bug) => {
    onCatchBug(bug);
    setBugs(prevBugs => {
      const newBugs = prevBugs.filter(b => b.id !== bug.id);
      // Add a new bug if we're below the minimum
      if (newBugs.length < 7) {
        newBugs.push(generateRandomBugs(mapSize.width, mapSize.height)[0]);
      }
      return newBugs;
    });
  };

  return (
    <div id="bug-map" className="relative w-full h-96 bg-green-200 border border-green-600 overflow-hidden">
      <h2 className="text-xl font-semibold mb-2">Bug Map</h2>
      {bugs.map((bug) => {
        const buttonStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${bug.x}px`,
          top: `${bug.y}px`,
          transform: 'translate(-50%, -50%)',
          height: bug.isKing ? '40px' : '30px',
          fontSize: bug.isKing ? '12px' : '10px',
          lineHeight: '1',
          whiteSpace: 'nowrap',
          padding: '4px 8px',
          transition: 'left 0.05s linear, top 0.05s linear',
        };

        return (
          <button
            key={bug.id}
            className={`absolute ${bug.isKing ? 'bg-yellow-500' : 'bg-red-500'} text-white rounded`}
            style={buttonStyle}
            onClick={() => handleCatchBug(bug)}
          >
            {bug.name}
          </button>
        );
      })}
    </div>
  );
}
