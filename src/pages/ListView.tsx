import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../context/usePokemon';
import type { Pokemon, SortKey, SortOrder } from '../types';
import { formatId, formatName } from '../utils';
import styles from './ListView.module.css';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'id', label: 'Pokédex number' },
  { value: 'name', label: 'Name' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
  { value: 'baseExperience', label: 'Base experience' },
];

function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.value === value);
}

function compare(a: Pokemon, b: Pokemon, key: SortKey): number {
  if (key === 'name') return a.name.localeCompare(b.name);
  return a[key] - b[key] || a.id - b.id;
}

export default function ListView() {
  const { pokemon, loading, error, retry } = usePokemon();
  // Keep the controls in the URL so they survive a trip to the detail page and back.
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort');
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'id';
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : 'asc';

  function updateParam(key: string, value: string, defaultValue: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === defaultValue) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? pokemon.filter(
          (p) => p.name.includes(q) || String(p.id) === q.replace(/^#0*/, ''),
        )
      : pokemon;
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    return order === 'desc' ? sorted.reverse() : sorted;
  }, [pokemon, query, sortKey, order]);

  const ids = results.map((p) => p.id);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Search Pokémon</h1>

      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search by name or number…"
          value={query}
          onChange={(e) => updateParam('q', e.target.value, '')}
          aria-label="Search Pokémon"
        />
        <label className={styles.sortLabel}>
          Sort by
          <select
            className={styles.select}
            value={sortKey}
            onChange={(e) => updateParam('sort', e.target.value, 'id')}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.orderGroup} role="group" aria-label="Sort order">
          <button
            type="button"
            className={order === 'asc' ? `${styles.orderBtn} ${styles.orderActive}` : styles.orderBtn}
            aria-pressed={order === 'asc'}
            onClick={() => updateParam('order', 'asc', 'asc')}
          >
            ↑ Asc
          </button>
          <button
            type="button"
            className={order === 'desc' ? `${styles.orderBtn} ${styles.orderActive}` : styles.orderBtn}
            aria-pressed={order === 'desc'}
            onClick={() => updateParam('order', 'desc', 'asc')}
          >
            ↓ Desc
          </button>
        </div>
      </div>

      <StatusMessage loading={loading} error={error} onRetry={retry} />

      {!loading && !error && (
        <>
          <p className={styles.count}>
            {results.length} result{results.length === 1 ? '' : 's'}
          </p>
          {results.length === 0 ? (
            <p className={styles.empty}>No Pokémon match “{query}”.</p>
          ) : (
            <ul className={styles.list}>
              {results.map((p) => (
                <li key={p.id}>
                  <Link to={`/pokemon/${p.id}`} state={{ ids }} className={styles.row}>
                    <img className={styles.thumb} src={p.image} alt="" loading="lazy" />
                    <span className={styles.id}>{formatId(p.id)}</span>
                    <span className={styles.name}>{formatName(p.name)}</span>
                    <span className={styles.types}>
                      {p.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </span>
                    <span className={styles.metrics}>
                      <span>{(p.height / 10).toFixed(1)} m</span>
                      <span>{(p.weight / 10).toFixed(1)} kg</span>
                      <span>{p.baseExperience} XP</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
