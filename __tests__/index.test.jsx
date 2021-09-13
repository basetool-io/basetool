// __tests__/index.test.jsx

/**
 * @jest-environment jsdom
 */

import sum from '../components/sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
