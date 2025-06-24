'use client';

import { useState } from 'react';
import { CategorySelect } from '@/components/CategorySelect';

export default function HomePage() {
  const [catId, setCatId] = useState<number | undefined>();

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quick Book</h1>
      <label className="block mb-2">Pick a category:</label>
      <CategorySelect
        value={catId}
        onChange={setCatId}
        placeholder="-- choose service --"
      />
      {catId && (
        <p className="mt-4">
          You picked category <strong>{catId}</strong>.
        </p>
      )}
    </main>
  );
}
