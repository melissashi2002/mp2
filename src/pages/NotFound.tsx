import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.page}>
      <h1>404</h1>
      <p>This page fled like a wild Pokémon.</p>
      <Link to="/">Back to search</Link>
    </section>
  );
}
