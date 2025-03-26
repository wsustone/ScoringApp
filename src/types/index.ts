export interface GolfHole {
  number: number;
  par: number;
  strokeIndex: number;
  distance: number;
}

export interface TeeSetting {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes: GolfHole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: TeeSetting[];
}

export interface HoleSetup {
  pin: string;
  teeBox: string;
  banker?: boolean;
  dots?: number;
  doubles?: boolean;
}
