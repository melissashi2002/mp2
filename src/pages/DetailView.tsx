import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import TypeBadge from '../components/TypeBadge';
import { usePokemon } from '../context/usePokemon';
import { formatId, formatName } from '../utils';
import styles from './DetailView.module.css';

interface LocationState {
  ids?: number[];
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export default function DetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pokemon, loading, error, retry } = usePokemon();

  const currentId = Number(id);
  // Cycle through the list the user came from (search results or filtered
  // gallery). Visiting the URL directly falls back to the full Pokédex.
  const stateIds = (location.state as LocationState | null)?.ids;
  const ids = stateIds?.includes(currentId) ? stateIds : pokemon.map((p) => p.id);
  const index = ids.indexOf(currentId);
  const prevId = index >= 0 ? ids[(index - 1 + ids.length) % ids.length] : undefined;
  const nextId = index >= 0 ? ids[(index + 1) % ids.length] : undefined;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && prevId !== undefined) {
        navigate(`/pokemon/${prevId}`, { state: { ids }, replace: true });
      } else if (e.key === 'ArrowRight' && nextId !== undefined) {
        navigate(`/pokemon/${nextId}`, { state: { ids }, replace: true });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevId, nextId, ids, navigate]);

  if (loading || error) {
    return (
      <section className={styles.page}>
        <StatusMessage loading={loading} error={error} onRetry={retry} />
      </section>
    );
  }

  const p = pokemon.find((x) => x.id === currentId);
  if (!p) {
    return (
      <section className={`${styles.page} ${styles.missing}`}>
        <h1>Pokémon not found</h1>
        <p>There’s no Pokémon with number “{id}” in this Pokédex.</p>
        <Link to="/" className={styles.backLink}>
          ← Back to search
        </Link>
      </section>
    );
  }

  const total = p.stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <section className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backLink} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className={styles.position}>
          {index + 1} / {ids.length}
        </span>
      </div>

      <div className={styles.navRow}>
        <Link
          to={`/pokemon/${prevId}`}
          state={{ ids }}
          replace
          className={styles.arrow}
          aria-label="Previous Pokémon"
        >
          ‹
        </Link>

        <article className={styles.card}>
          <div className={`${styles.hero} ${styles[p.types[0]] ?? ''}`}>
            <img src={p.image} alt={formatName(p.name)} className={styles.image} />
          </div>

          <div className={styles.info}>
            <span className={styles.id}>{formatId(p.id)}</span>
            <h1 className={styles.name}>{formatName(p.name)}</h1>
            <div className={styles.types}>
              {p.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>

            <dl className={styles.facts}>
              <div>
                <dt>Height</dt>
                <dd>{(p.height / 10).toFixed(1)} m</dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd>{(p.weight / 10).toFixed(1)} kg</dd>
              </div>
              <div>
                <dt>Base XP</dt>
                <dd>{p.baseExperience}</dd>
              </div>
            </dl>

            <h2 className={styles.heading}>Abilities</h2>
            <ul className={styles.abilities}>
              {p.abilities.map((a) => (
                <li key={a}>{formatName(a)}</li>
              ))}
            </ul>

            <h2 className={styles.heading}>Base stats</h2>
            <div className={styles.stats}>
              {p.stats.map((s) => (
                <div key={s.name} className={styles.statRow}>
                  <span className={styles.statName}>{STAT_LABELS[s.name] ?? formatName(s.name)}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <meter className={styles.meter} min={0} max={255} value={s.value} />
                </div>
              ))}
              <div className={`${styles.statRow} ${styles.totalRow}`}>
                <span className={styles.statName}>Total</span>
                <span className={styles.statValue}>{total}</span>
              </div>
            </div>
          </div>
        </article>

        <Link
          to={`/pokemon/${nextId}`}
          state={{ ids }}
          replace
          className={styles.arrow}
          aria-label="Next Pokémon"
        >
          ›
        </Link>
      </div>

      <p className={styles.hint}>Tip: use the ← → arrow keys to browse.</p>
    </section>
  );
}
