import { PlanetData } from './game';

export type NavigationState =
  | { type: 'home' }
  | { type: 'object'; id: string }
  | { type: 'overseer'; id: string }
  | { type: 'planets'; overseerId: string; universeId: string; universeName: string }
  | { type: 'planet-details'; planetId: string; overseerId: string; universeId: string; planetData: PlanetData };

export interface NavigationContextValue {
  currentPage: NavigationState;
  navigateTo: (page: NavigationState) => void;
  goBack: () => void;
  history: NavigationState[];
}
