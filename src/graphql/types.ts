export interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
  distance: number;
}

export interface TeeSet {
  name: string;
  courseRating: number;
  slopeRating: number;
  front9Holes: Hole[];
  back9Holes: Hole[];
}

export interface GolfCourse {
  name: string;
  location: string;
  menTees: TeeSet[];
  ladyTees: TeeSet[];
}

export interface CourseTees {
  menTees: TeeSet[];
  ladyTees: TeeSet[];
}
