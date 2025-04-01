import { sortPlayersForBankerCalc, calculatePoints } from '../scoring';

describe('sortPlayersForBankerCalc', () => {
  const players = [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];

  test('returns original array if no banker', () => {
    expect(sortPlayersForBankerCalc(players, null)).toEqual(players);
  });

  test('moves banker to end of array', () => {
    const sorted = sortPlayersForBankerCalc(players, '2');
    expect(sorted).toHaveLength(3);
    expect(sorted[sorted.length - 1].id).toBe('2');
    expect(sorted).toEqual([
      { id: '1' },
      { id: '3' },
      { id: '2' }
    ]);
  });

  test('handles banker not in array', () => {
    const sorted = sortPlayersForBankerCalc(players, '4');
    expect(sorted).toEqual(players);
  });
});

describe('calculatePoints', () => {
  test('calculates points for eagle or better', () => {
    expect(calculatePoints(2, 4)).toBe(4); // Eagle
    expect(calculatePoints(1, 4)).toBe(4); // Double Eagle
    expect(calculatePoints(2, 5)).toBe(4); // Eagle
  });

  test('calculates points for birdie', () => {
    expect(calculatePoints(3, 4)).toBe(2); // Birdie
    expect(calculatePoints(4, 5)).toBe(2); // Birdie
  });

  test('calculates points for par', () => {
    expect(calculatePoints(4, 4)).toBe(1); // Par
    expect(calculatePoints(3, 3)).toBe(1); // Par
  });

  test('calculates points for bogey or worse', () => {
    expect(calculatePoints(5, 4)).toBe(0); // Bogey
    expect(calculatePoints(6, 4)).toBe(0); // Double Bogey
    expect(calculatePoints(7, 4)).toBe(0); // Triple Bogey
  });
});
