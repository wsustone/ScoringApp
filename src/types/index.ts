export interface Course {
  id: string;
  name: string;
  location: string;
  teeSets: TeeSet[];
}

export interface TeeSet {
  id: string;
  name: string;
  courseRating: number;
  slopeRating: number;
  holes: Hole[];
}

export interface ExtendedTeeSet extends TeeSet {
  type: 'front9' | 'back9';
}

export interface CourseTees {
  menTees: TeeSet[];
  ladyTees: TeeSet[];
}

export interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
  handicap: number;
  distance: number;
  yardage: number;
}

export interface HoleSetup {
  banker: string | null;
  dots: number;
  doubles: { [key: string]: boolean };
}

export interface Score {
  [key: string]: { [key: number]: number | null };
}
