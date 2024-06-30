"use client";
export default function BugCollection({ bugs }: any) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Your Bug Collection</h2>
      {bugs.length === 0 ? (
        <p>No bugs caught yet. Go catch some!</p>
      ) : (
        <ul>
          {bugs.map((bug: any) => (
            <li key={bug.id}>{bug.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
