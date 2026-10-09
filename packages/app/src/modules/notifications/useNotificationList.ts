import { useCallback, useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  GetNotificationsResponse,
  notificationsApiRef,
} from '@backstage/plugin-notifications';
import { FilterState, toQuery } from './filters';

export type Notification = GetNotificationsResponse['notifications'][number];

interface ListState {
  notifications: Notification[];
  totalCount: number;
  loading: boolean;
  error?: Error;
}

/** The notifications that match the filters, one page at a time. */
export function useNotificationList(
  filters: FilterState,
  offset: number,
  limit: number,
) {
  const notificationsApi = useApi(notificationsApiRef);
  const [state, setState] = useState<ListState>({
    notifications: [],
    totalCount: 0,
    loading: true,
  });
  const [version, setVersion] = useState(0);
  const key = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    // The cut off of "last 24 hours" is computed on every fetch.
    notificationsApi
      .getNotifications({
        ...toQuery(JSON.parse(key) as FilterState),
        offset,
        limit,
      })
      .then(({ notifications, totalCount }) => {
        if (!cancelled) {
          setState({ notifications, totalCount, loading: false });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({
            notifications: [],
            totalCount: 0,
            loading: false,
            error,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [notificationsApi, key, offset, limit, version]);

  const refresh = useCallback(() => setVersion(value => value + 1), []);
  return { ...state, refresh };
}
