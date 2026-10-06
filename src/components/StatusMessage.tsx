import styles from './StatusMessage.module.css';

interface Props {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function StatusMessage({ loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <div className={styles.box} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Catching Pokémon…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`${styles.box} ${styles.error}`} role="alert">
        <p>{error}</p>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }
  return null;
}
