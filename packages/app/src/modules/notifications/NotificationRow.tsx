import { Link } from 'react-router-dom';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import CheckIcon from '@material-ui/icons/Check';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import UndoIcon from '@material-ui/icons/Replay';
import { Notification } from './useNotificationList';
import styles from './NotificationRow.module.css';

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
};

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/**
 * "3 hours ago", "yesterday"... The API returns the dates of a notification as ISO
 * strings, although the client types them as `Date`.
 */
function timeAgo(date: Date | string, now = Date.now()): string {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) {
    return '';
  }
  const seconds = Math.round((time - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  const [unit, size] =
    UNITS.find(([, length]) => Math.abs(seconds) >= length) ??
    (['minute', 60] as const);
  return formatter.format(Math.round(seconds / size), unit);
}

export interface NotificationRowProps {
  notification: Notification;
  onToggleRead: (notification: Notification) => void;
  onToggleSaved: (notification: Notification) => void;
}

export function NotificationRow({
  notification,
  onToggleRead,
  onToggleSaved,
}: NotificationRowProps) {
  const { payload, origin, created } = notification;
  const unread = !notification.read;
  const saved = Boolean(notification.saved);
  const severity = payload.severity ?? 'normal';

  const title = payload.link ? (
    <LinkTitle
      href={payload.link}
      onOpen={() => unread && onToggleRead(notification)}
    >
      {payload.title}
    </LinkTitle>
  ) : (
    <span className={styles.titleText}>{payload.title}</span>
  );

  return (
    <li className={unread ? `${styles.row} ${styles.unread}` : styles.row}>
      <span className={styles.icon} data-severity={severity}>
        <NotificationsIcon />
      </span>

      <div className={styles.content}>
        <div className={styles.titleLine}>
          {unread && <span className={styles.dot} aria-label="Unread" />}
          {title}
          {SEVERITY_LABELS[severity] && (
            <span className={styles.severity} data-severity={severity}>
              {SEVERITY_LABELS[severity]}
            </span>
          )}
        </div>
        {payload.description && (
          <p className={styles.description}>{payload.description}</p>
        )}
        <p className={styles.meta}>
          {[payload.topic, origin, timeAgo(created)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.action}
          aria-label={unread ? 'Mark as read' : 'Mark as unread'}
          title={unread ? 'Mark as read' : 'Mark as unread'}
          onClick={() => onToggleRead(notification)}
        >
          {unread ? <CheckIcon /> : <UndoIcon />}
        </button>
        <button
          type="button"
          className={styles.action}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          title={saved ? 'Remove from saved' : 'Save'}
          onClick={() => onToggleSaved(notification)}
        >
          {saved ? (
            <BookmarkIcon className={styles.saved} />
          ) : (
            <BookmarkBorderIcon />
          )}
        </button>
      </div>
    </li>
  );
}

function LinkTitle({
  href,
  onOpen,
  children,
}: {
  href: string;
  onOpen: () => void;
  children: string;
}) {
  if (href.startsWith('/')) {
    return (
      <Link className={styles.titleLink} to={href} onClick={onOpen}>
        {children}
      </Link>
    );
  }
  return (
    <a
      className={styles.titleLink}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onOpen}
    >
      {children}
    </a>
  );
}
