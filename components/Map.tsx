"use client";
import { useEffect } from 'react';

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

interface MapProps {
  bugs: Bug[];
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>;
  onCatchBug: (bug: Bug) => void;
  mapSize: { width: number; height: number };
}

export default function Map({ bugs, setBugs, onCatchBug, mapSize }: MapProps) {
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
  }, [setBugs, mapSize]);

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
            onClick={() => onCatchBug(bug)}
          >
            {bug.name}
          </button>
        );
      })}
    </div>
  );
}
