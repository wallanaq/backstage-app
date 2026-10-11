import { ReactNode } from 'react';
import styles from './DpCard.module.css';

export interface DpCardProps {
  icon: ReactNode;
  title: string;
  /** Small pill after the title ("1", "0"). */
  count?: number;
  /** Buttons at the end of the header. */
  actions?: ReactNode;
  /** Quiet line below the body ("1 recurso vinculado"). */
  footer?: ReactNode;
  /** The body has no padding (tables, diagrams). */
  flush?: boolean;
  children: ReactNode;
}

/** The white card of the entity page: a header with icon and title, then the body. */
export function DpCard({
  icon,
  title,
  count,
  actions,
  footer,
  flush,
  children,
}: DpCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
        <h3 className={styles.title}>{title}</h3>
        {count !== undefined && <span className={styles.count}>{count}</span>}
        {actions && <span className={styles.actions}>{actions}</span>}
      </header>
      <div className={flush ? styles.flush : styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}

/** Round icon and a message, for cards with nothing to list. */
export function EmptyState({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden>
        {icon}
      </span>
      <p className={styles.emptyMessage}>{children}</p>
    </div>
  );
}

/** Icon button of a card header: a link when it has an `href`, otherwise a button. */
export function CardAction({
  label,
  href,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return href ? (
    <a
      className={styles.action}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      className={styles.action}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
