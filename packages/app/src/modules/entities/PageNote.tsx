import InfoIcon from '@material-ui/icons/InfoOutlined';
import styles from './PageNote.module.css';

/** The small footnote below the list cards. */
export function PageNote({
  children,
  flush,
}: {
  children: string;
  /** Do not indent the note to line up with the results column. */
  flush?: boolean;
}) {
  return (
    <p className={flush ? `${styles.note} ${styles.flush}` : styles.note}>
      <InfoIcon className={styles.icon} />
      {children}
    </p>
  );
}
