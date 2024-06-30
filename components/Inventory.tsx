import React from 'react';

interface InventoryProps {
  items: string[];
}

export default function Inventory({ items }: InventoryProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Your Inventory</h2>
      {items.length === 0 ? (
        <p>No items in your inventory.</p>
      ) : (
        <ul className="list-disc list-inside">
          {items.map((item, index) => (
            <li key={index} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
