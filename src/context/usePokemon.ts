import { useContext } from 'react';
import { PokemonContext } from './pokemonContextValue';

export function usePokemon() {
  const ctx = useContext(PokemonContext);
  if (!ctx) throw new Error('usePokemon must be used inside <PokemonProvider>');
  return ctx;
}
