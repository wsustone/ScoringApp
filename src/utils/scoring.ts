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
