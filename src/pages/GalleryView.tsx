import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../context/usePokemon';
import { formatId, formatName } from '../utils';
import styles from './GalleryView.module.css';

type MatchMode = 'any' | 'all';

export default function GalleryView() {
  const { pokemon, loading, error, retry } = usePokemon();
  const [params, setParams] = useSearchParams();
  const selected = useMemo(
    () => (params.get('types') ?? '').split(',').filter(Boolean),
    [params],
  );
  const mode: MatchMode = params.get('match') === 'all' ? 'all' : 'any';

  const allTypes = useMemo(
    () => [...new Set(pokemon.flatMap((p) => p.types))].sort(),
    [pokemon],
  );

  function setSelected(types: string[]) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (types.length) next.set('types', types.join(','));
        else next.delete('types');
        return next;
      },
      { replace: true },
    );
  }

  function toggleType(type: string) {
    setSelected(selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type]);
  }

  function setMode(next: MatchMode) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next === 'any') p.delete('match');
        else p.set('match', next);
        return p;
      },
      { replace: true },
    );
  }

  const results = useMemo(() => {
    if (!selected.length) return pokemon;
    return pokemon.filter((p) =>
      mode === 'all'
        ? selected.every((t) => p.types.includes(t))
        : selected.some((t) => p.types.includes(t)),
    );
  }, [pokemon, selected, mode]);

  const ids = results.map((p) => p.id);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Gallery</h1>

      {!loading && !error && (
        <div className={styles.filters}>
          <div className={styles.filterHeader}>
            <span className={styles.filterLabel}>Filter by type</span>
            <div className={styles.modeGroup} role="group" aria-label="Match mode">
              <button
                type="button"
                className={mode === 'any' ? `${styles.modeBtn} ${styles.modeActive}` : styles.modeBtn}
                aria-pressed={mode === 'any'}
                onClick={() => setMode('any')}
              >
                Any selected
              </button>
              <button
                type="button"
                className={mode === 'all' ? `${styles.modeBtn} ${styles.modeActive}` : styles.modeBtn}
                aria-pressed={mode === 'all'}
                onClick={() => setMode('all')}
              >
                All selected
              </button>
            </div>
            {selected.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => setSelected([])}>
                Clear
              </button>
            )}
          </div>
          <div className={styles.typeList}>
            {allTypes.map((t) => (
              <TypeBadge
                key={t}
                type={t}
                as="button"
                selected={selected.includes(t)}
                onClick={() => toggleType(t)}
              />
            ))}
          </div>
        </div>
      )}

      <StatusMessage loading={loading} error={error} onRetry={retry} />

      {!loading && !error && (
        <>
          <p className={styles.count}>
            Showing {results.length} of {pokemon.length}
          </p>
          {results.length === 0 ? (
            <p className={styles.empty}>No Pokémon have all of those types. Try “Any selected”.</p>
          ) : (
            <ul className={styles.grid}>
              {results.map((p) => (
                <li key={p.id}>
                  <Link to={`/pokemon/${p.id}`} state={{ ids }} className={styles.card}>
                    <div className={`${styles.art} ${styles[p.types[0]] ?? ''}`}>
                      <img src={p.image} alt={formatName(p.name)} loading="lazy" />
                    </div>
                    <div className={styles.caption}>
                      <span className={styles.id}>{formatId(p.id)}</span>
                      <span className={styles.name}>{formatName(p.name)}</span>
                    </div>
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
