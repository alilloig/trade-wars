export type ElementType = 'erbium' | 'lanthanum' | 'thorium';

export interface PlanetData {
  id: string;
  galaxy: number;
  system: number;
  position: number;
  imageIndex: number;
}

export interface PlanetReserves {
  erbium: number;
  lanthanum: number;
  thorium: number;
}

export interface MineLevels {
  erbium: number;
  lanthanum: number;
  thorium: number;
}

export interface UpgradeCosts {
  erbium: { erbium: number; lanthanum: number; thorium: number };
  lanthanum: { erbium: number; lanthanum: number; thorium: number };
  thorium: { erbium: number; lanthanum: number; thorium: number };
}

export interface UniverseData {
  id: string;
  name: string;
  galaxies: number;
  systems: number;
  planets: number;
  open: boolean;
}

export interface OverseerData {
  id: string;
  universes: string[];
  planets: Record<string, string[]>; // universeId -> planetIds
}
