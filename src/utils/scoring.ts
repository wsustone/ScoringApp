// Sort players for banker calculations - non-bankers first
export const sortPlayersForBankerCalc = (players: { id: string }[], bankerId: string | null): { id: string }[] => {
  if (!bankerId) return players;
  return [...players].sort((a, b) => {
    if (a.id === bankerId) return 1;
    if (b.id === bankerId) return -1;
    return 0;
  });
};

export const calculatePoints = (score: number, par: number): number => {
  const diff = score - par;
  if (diff <= -2) return 4;  // Eagle or better
  if (diff === -1) return 2; // Birdie
  if (diff === 0) return 1;  // Par
  return 0;  // Bogey or worse
};

export const calculateHandicapStrokes = (
  playerHandicap: number,
  courseRating: number,
  slopeRating: number,
  scoringIndex: number,
  holes: number = 18
): number => {
  // Calculate course handicap
  const courseHandicap = Math.round(playerHandicap * (slopeRating / 113) + (courseRating - 72));
  
  // Calculate strokes for this hole based on scoring index
  const totalStrokes = Math.round((courseHandicap * holes) / 18);
  
  // If scoring index is less than or equal to total strokes, player gets a stroke
  // If scoring index is less than or equal to (total strokes - 18), player gets two strokes
  if (scoringIndex <= totalStrokes - 18) {
    return 2;
  } else if (scoringIndex <= totalStrokes) {
    return 1;
  }
  return 0;
};
