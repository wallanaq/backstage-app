import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';

const CHANGED = 'devportal:notifications-changed';
const POLL_MS = 30_000;

/** Tells the unread counters that notifications were read or created. */
export function notifyNotificationsChanged() {
  window.dispatchEvent(new Event(CHANGED));
}

/**
 * Number of unread notifications of the user, `undefined` until it is known.
 * It is refreshed every 30 seconds and whenever notifications are changed
 * from the notifications page.
 */
export function useUnreadCount(): number | undefined {
  const notificationsApi = useApi(notificationsApiRef);
  const [unread, setUnread] = useState<number>();

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      notificationsApi
        .getStatus()
        .then(status => {
          if (!cancelled) setUnread(status.unread);
        })
        .catch(() => {
          // The counter is decoration, the page itself reports errors.
        });
    };

    load();
    const interval = setInterval(load, POLL_MS);
    window.addEventListener(CHANGED, load);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(CHANGED, load);
    };
  }, [notificationsApi]);

  return unread;
}
