import { ReactNode } from 'react';
import styles from './WidgetCard.module.css';

export interface WidgetCardProps {
  icon: ReactNode;
  title: string;
  /** A small counter next to the title. */
  badge?: number;
  children: ReactNode;
}

/** The white card with a header that every home page widget is drawn in. */
export function WidgetCard({ icon, title, badge, children }: WidgetCardProps) {
  return (
    <section className={styles.card} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={styles.title}>{title}</h2>
        {badge !== undefined && <span className={styles.badge}>{badge}</span>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
