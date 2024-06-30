"use client";
import { useState, useEffect } from 'react';

const generateRandomBugs = () => {
  const bugTypes = ['Butterfly', 'Beetle', 'Ladybug', 'Mantis', 'Ant'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: bugTypes[Math.floor(Math.random() * bugTypes.length)],
    x: Math.random() * 300,
    y: Math.random() * 200,
    endurance: Math.floor(Math.random() * 101),
  }));
};

export default function Map({ onCatchBug }: any) {
  const [bugs, setBugs] = useState<any[]>([]);

  useEffect(() => {
    setBugs(generateRandomBugs());
  }, []);

  const handleCatchBug = (bug: any) => {
    onCatchBug(bug);
    setBugs(bugs.filter(b => b.id !== bug.id));
  };

  return (
    <div className="relative w-full h-64 bg-green-200 border border-green-600">
      <h2 className="text-xl font-semibold mb-2">Bug Map</h2>
      {bugs.map((bug) => (
        <button
          key={bug.id}
          className="absolute p-2 bg-red-500 text-white rounded"
          style={{ left: `${bug.x}px`, top: `${bug.y}px` }}
          onClick={() => handleCatchBug(bug)}
        >
          {bug.name}
        </button>
      ))}
    </div>
  );
}
