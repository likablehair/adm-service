import { expect, test } from 'vitest';
import { add } from 'src/main';
test('add', () => {
  expect(add(2, 2)).toBe(4);
});
