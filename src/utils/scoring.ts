// Sort players for banker calculations - non-bankers first
export const sortPlayersForBankerCalc = (players: { id: string }[], bankerId: string | null): { id: string }[] => {
  if (!bankerId) return players;
  return [...players].sort((a, b) => {
    if (a.id === bankerId) return 1;
    if (b.id === bankerId) return -1;
    return 0;
  });
};

export const calculatePoints = (
  playerScore: number | null,
  bankerScore: number | null,
  holePar: number,
  dots: number,
  isPlayerDoubled: boolean,
  isBankerDoubled: boolean,
  doubleBirdieBets: boolean,
  useGrossBirdies: boolean,
  isPar3: boolean,
  par3Triples: boolean
): number => {
  if (playerScore === null || bankerScore === null) return 0;
  if (playerScore === bankerScore) return 0;

  let multiplier = 1;
  
  // Handle Par 3 triple bets if enabled
  if (isPar3 && par3Triples) {
    if (isPlayerDoubled) multiplier *= 3;
    if (isBankerDoubled) multiplier *= 3;
  } else {
    if (isPlayerDoubled) multiplier *= 2;
    if (isBankerDoubled) multiplier *= 2;
  }

  // Handle gross birdies/eagles if enabled
  if (useGrossBirdies) {
    // Find the highest multiplier from all cases
    const birdieEagleMultiplier = Math.max(
      // Banker cases
      bankerScore === holePar - 1 ? 2 : 1,  // Birdie
      bankerScore <= holePar - 2 ? 4 : 1,   // Eagle or better
      // Player cases
      playerScore === holePar - 1 ? 2 : 1,  // Birdie
      playerScore <= holePar - 2 ? 4 : 1    // Eagle or better
    );
    multiplier *= birdieEagleMultiplier;
  }

  // Handle birdie/eagle doubles from schema if enabled
  if (doubleBirdieBets && !useGrossBirdies) {
    // This is only used if useGrossBirdies is false, to maintain schema compatibility
    const birdieEagleMultiplier = Math.max(
      // Banker cases
      bankerScore === holePar - 1 ? 2 : 1,  // Birdie
      bankerScore <= holePar - 2 ? 4 : 1,   // Eagle or better
      // Player cases
      playerScore === holePar - 1 ? 2 : 1,  // Birdie
      playerScore <= holePar - 2 ? 4 : 1    // Eagle or better
    );
    multiplier *= birdieEagleMultiplier;
  }

  // Calculate base points (dots) and determine winner
  const points = dots * multiplier;
  
  // Return positive points if player wins (lower score), negative if banker wins
  return playerScore < bankerScore ? points : -points;
};
