/**
 * Calculate course handicap from handicap index and course ratings
 * @param handicapIndex Player's handicap index
 * @param slopeRating Course slope rating
 * @returns Calculated course handicap (rounded)
 */
export const calculateCourseHandicap = (handicapIndex: number, slopeRating: number): number => {
  // Course Handicap = Handicap Index × (Slope Rating ÷ 113)
  return Math.round(handicapIndex * (slopeRating / 113));
};

/**
 * Calculate handicap strokes for a hole based on course handicap and stroke index
 * @param courseHandicap Player's course handicap
 * @param strokeIndex Hole's stroke index (1-18)
 * @returns Number of strokes to apply
 */
export const calculateHandicapStrokes = (courseHandicap: number, strokeIndex: number): number => {
  if (courseHandicap <= 0) return 0;

  // First round: Base strokes for handicaps 1-18
  // For stroke index, 1 is hardest, 18 is easiest
  const baseStrokes = courseHandicap <= 18 ? 
    (strokeIndex <= courseHandicap ? 1 : 0) :
    1;

  // Second round: Additional stroke for handicaps 19-36 based on stroke index
  // For a handicap of 20, they get an extra stroke on holes with index 1 and 2
  const remainingStrokes = Math.max(0, courseHandicap - 18);
  const secondRoundStrokes = courseHandicap > 18 ? 
    (strokeIndex <= remainingStrokes ? 1 : 0) :
    0;

  // Third round: Extra stroke on hardest holes for handicaps 37+
  // For a handicap of 40, they get a third stroke on holes with index 1-4
  const thirdRoundRemainder = Math.max(0, courseHandicap - 36);
  const thirdRoundStrokes = courseHandicap > 36 ? 
    (strokeIndex <= thirdRoundRemainder ? 1 : 0) :
    0;

  return baseStrokes + secondRoundStrokes + thirdRoundStrokes;
};

/**
 * Calculate maximum score for a hole based on par, course handicap, and stroke index
 * @param par Par for the hole
 * @param courseHandicap Player's course handicap
 * @param strokeIndex Hole's stroke index (1-18)
 * @returns Maximum score allowed for handicap purposes (net double bogey)
 */
export const calculateMaxScore = (par: number, courseHandicap: number, strokeIndex: number): number => {
  // Net double bogey = Double bogey (par + 2) + handicap strokes
  const doubleBogey = par + 2;
  const handicapStrokes = calculateHandicapStrokes(courseHandicap, strokeIndex);
  return doubleBogey + handicapStrokes;
};
