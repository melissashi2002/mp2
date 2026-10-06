import styles from './TypeBadge.module.css';

interface Props {
  type: string;
  as?: 'span' | 'button';
  selected?: boolean;
  onClick?: () => void;
}

export default function TypeBadge({ type, as = 'span', selected, onClick }: Props) {
  const classes = [styles.badge, styles[type], as === 'button' ? styles.button : '', selected ? styles.selected : '']
    .filter(Boolean)
    .join(' ');

  if (as === 'button') {
    return (
      <button type="button" className={classes} aria-pressed={selected} onClick={onClick}>
        {type}
      </button>
    );
  }
  return <span className={classes}>{type}</span>;
}
