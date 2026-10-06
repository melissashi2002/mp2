import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.ball} aria-hidden="true" />
          Pokédex
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/" end className={linkClass}>
            Search
          </NavLink>
          <NavLink to="/gallery" className={linkClass}>
            Gallery
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
