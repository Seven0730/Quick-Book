'use client';
import { useState } from 'react';
import { CategorySelect } from '@/components/CategorySelect';
import { PriceSlider } from '@/components/PriceSlider';

export default function HomePage() {
  const [catId, setCatId] = useState<number>();
  const [price, setPrice] = useState<number>();

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Quick Book</h1>

      <div>
        <label className="block mb-1">1. Service Category</label>
        <CategorySelect value={catId} onChange={setCatId} />
      </div>

      <div>
        <label className="block mb-1">2. Your Price</label>
        <PriceSlider
          categoryId={catId}
          value={price}
          onChange={setPrice}
        />
      </div>

    </main>
  );
}
