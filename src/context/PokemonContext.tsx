import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchAllPokemon } from '../api/pokeapi';
import type { Pokemon } from '../types';
import { PokemonContext } from './pokemonContextValue';

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchAllPokemon()
      .then((data) => {
        if (!cancelled) setPokemon(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not reach PokeAPI. Check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return (
    <PokemonContext.Provider value={{ pokemon, loading, error, retry }}>
      {children}
    </PokemonContext.Provider>
  );
}
