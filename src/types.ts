export interface Stat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  baseExperience: number;
  types: string[];
  abilities: string[];
  stats: Stat[];
  image: string;
}

export type SortKey = 'id' | 'name' | 'height' | 'weight' | 'baseExperience';
export type SortOrder = 'asc' | 'desc';
