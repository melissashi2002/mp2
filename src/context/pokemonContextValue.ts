import { createContext } from 'react';
import type { Pokemon } from '../types';

export interface PokemonContextValue {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export const PokemonContext = createContext<PokemonContextValue | null>(null);
