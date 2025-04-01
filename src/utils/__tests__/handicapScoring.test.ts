import { calculateCourseHandicap, calculateHandicapStrokes, calculateMaxScore } from '../handicapScoring';

describe('calculateCourseHandicap', () => {
  test('correctly calculates course handicap', () => {
    expect(calculateCourseHandicap(18, 125)).toBe(20); // 18 * (125/113) = 19.91 rounds to 20
    expect(calculateCourseHandicap(10, 113)).toBe(10); // 10 * (113/113) = 10
    expect(calculateCourseHandicap(15, 130)).toBe(17); // 15 * (130/113) = 17.26 rounds to 17
  });
});

describe('calculateHandicapStrokes', () => {
  test('handles handicaps 1-18', () => {
    // Handicap 9 should get strokes on holes with index 1-9
    expect(calculateHandicapStrokes(9, 1)).toBe(1);  // Gets stroke on index 1
    expect(calculateHandicapStrokes(9, 9)).toBe(1);  // Gets stroke on index 9
    expect(calculateHandicapStrokes(9, 10)).toBe(0); // No stroke on index 10
    expect(calculateHandicapStrokes(9, 18)).toBe(0); // No stroke on index 18
  });

  test('handles handicaps > 18', () => {
    // Handicap 20 should get:
    // - 1 stroke on all holes (base)
    // - Extra stroke on holes with index 1-2 (20-18 = 2)
    expect(calculateHandicapStrokes(20, 1)).toBe(2);  // Index 1: base + extra
    expect(calculateHandicapStrokes(20, 2)).toBe(2);  // Index 2: base + extra
    expect(calculateHandicapStrokes(20, 3)).toBe(1);  // Index 3: base only
    expect(calculateHandicapStrokes(20, 18)).toBe(1); // Index 18: base only
  });

  test('handles handicap 36', () => {
    // Handicap 36 should get:
    // - 1 stroke on all holes (base)
    // - Extra stroke on holes with index 1-18 (36-18 = 18)
    expect(calculateHandicapStrokes(36, 1)).toBe(2);  // Index 1: base + extra
    expect(calculateHandicapStrokes(36, 18)).toBe(2); // Index 18: base + extra
  });
  test('handles handicap 40', () => {
    // Handicap 40 should get:
    // - 2 strokes on all holes (base + second round)
    // - Third stroke on holes 1-4 (40-36 = 4)
    expect(calculateHandicapStrokes(40, 1)).toBe(3);  // Index 1: base + second + third
    expect(calculateHandicapStrokes(40, 4)).toBe(3);  // Index 4: base + second + third
    expect(calculateHandicapStrokes(40, 5)).toBe(2);  // Index 5: base + second
    expect(calculateHandicapStrokes(40, 18)).toBe(2); // Index 18: base + second
  });
  test('handles zero handicap', () => {
    expect(calculateHandicapStrokes(0, 1)).toBe(0);
    expect(calculateHandicapStrokes(0, 18)).toBe(0);
  });
});

describe('calculateMaxScore', () => {
  test('calculates maximum score correctly', () => {
    // Par 4, handicap 9, stroke index 1 (gets 1 stroke)
    expect(calculateMaxScore(4, 9, 1)).toBe(7); // Double bogey (6) + 1 stroke

    // Par 4, handicap 9, stroke index 10 (no strokes)
    expect(calculateMaxScore(4, 9, 10)).toBe(6); // Double bogey (6) + 0 strokes

    // Par 4, handicap 20, stroke index 1 (gets 2 strokes)
    expect(calculateMaxScore(4, 20, 1)).toBe(8); // Double bogey (6) + 2 strokes

    // Par 3, handicap 40, stroke index 18 (gets 2 strokes)
    expect(calculateMaxScore(3, 40, 18)).toBe(7); // Double bogey (5) + 2 stroke
  });
});
