import axios from 'axios';
import type { Pokemon } from '../types';

// Generation 1 keeps the dataset small enough to sort and filter client-side.
export const POKEMON_LIMIT = 151;

const CACHE_KEY = `pokedex-cache-v1-${POKEMON_LIMIT}`;
const BATCH_SIZE = 30;

const client = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
});

interface NamedResource {
  name: string;
  url: string;
}

interface PokemonListResponse {
  results: NamedResource[];
}

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
}

function toPokemon(data: PokemonResponse): Pokemon {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience ?? 0,
    types: [...data.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    image:
      data.sprites.other?.['official-artwork']?.front_default ??
      data.sprites.front_default ??
      '',
  };
}

function readCache(): Pokemon[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Pokemon[]) : null;
  } catch {
    return null;
  }
}

function writeCache(pokemon: Pokemon[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(pokemon));
  } catch {
    // Storage may be full or disabled; the app still works without the cache.
  }
}

// PokeAPI's list endpoint only returns names, so fetch each Pokémon's details
// in small batches to stay polite with the API's rate limits.
export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const cached = readCache();
  if (cached) return cached;

  const { data } = await client.get<PokemonListResponse>('/pokemon', {
    params: { limit: POKEMON_LIMIT },
  });

  const pokemon: Pokemon[] = [];
  for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
    const batch = data.results.slice(i, i + BATCH_SIZE);
    const responses = await Promise.all(
      batch.map((p) => client.get<PokemonResponse>(`/pokemon/${p.name}`)),
    );
    pokemon.push(...responses.map((r) => toPokemon(r.data)));
  }

  pokemon.sort((a, b) => a.id - b.id);
  writeCache(pokemon);
  return pokemon;
}
