import { ReactNode } from 'react';
import styles from './SettingsCard.module.css';

export interface SettingsCardProps {
  icon: ReactNode;
  title: string;
  /** Rendered at the end of the header, e.g. a menu. */
  action?: ReactNode;
  children: ReactNode;
}

/** A white card with a 64px header, the building block of the settings. */
export function SettingsCard({
  icon,
  title,
  action,
  children,
}: SettingsCardProps) {
  return (
    <section className={styles.card} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={styles.title}>{title}</h2>
        {action}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
