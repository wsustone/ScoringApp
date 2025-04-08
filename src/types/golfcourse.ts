import { TeeSetting } from './game';

export interface GolfCourse {
  id: string;
  name: string;
  tee_settings: TeeSetting[];
}
