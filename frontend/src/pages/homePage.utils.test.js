import test from 'node:test';
import assert from 'node:assert/strict';
import { getHomeFeaturedProducts } from './homePage.utils.js';

test('returns featured products when they exist', () => {
  const products = [
    { _id: '1', isFeatured: false },
    { _id: '2', isFeatured: true },
    { _id: '3', isFeatured: 'TRUE' },
    { _id: '4', isFeatured: 1 },
  ];

  assert.deepEqual(getHomeFeaturedProducts(products), [
    { _id: '2', isFeatured: true },
    { _id: '3', isFeatured: 'TRUE' },
    { _id: '4', isFeatured: 1 },
  ]);
});

test('falls back to the catalog when no products are flagged as featured', () => {
  const products = [
    { _id: '1', isFeatured: false },
    { _id: '2', isFeatured: false },
    { _id: '3', isFeatured: 'false' },
  ];

  assert.deepEqual(getHomeFeaturedProducts(products), products);
});
