import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';
import { SearchField } from '@backstage/ui';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import { FilterSelect } from '../entities/FilterSelects';
import { SupportMenu } from '../entities/SupportMenu';
import {
  ANY_TOPIC,
  DEFAULT_FILTERS,
  FilterState,
  PERIODS,
  PeriodId,
  SEVERITIES,
  Severity,
  SORTS,
  SortId,
  TITLES,
  VIEWS,
  ViewId,
} from './filters';
import { NotificationRow } from './NotificationRow';
import { Pagination } from './Pagination';
import { Notification, useNotificationList } from './useNotificationList';
import { notifyNotificationsChanged } from './useUnreadCount';
import styles from './NotificationsPage.module.css';

function useTopics(version: number) {
  const notificationsApi = useApi(notificationsApiRef);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    notificationsApi
      .getTopics()
      .then(response => {
        if (!cancelled) setTopics([...response.topics].sort());
      })
      .catch(() => {
        // The topic filter simply offers "Qualquer tópico".
      });
    return () => {
      cancelled = true;
    };
  }, [notificationsApi, version]);

  return topics;
}

function EmptyState({ view }: { view: ViewId }) {
  const unread = view === 'unread';
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <NotificationsIcon />
      </span>
      <div className={styles.emptyText}>
        <h3 className={styles.emptyTitle}>
          {unread ? 'No unread notifications' : 'No notifications found'}
        </h3>
        <p className={styles.emptyHint}>
          {unread
            ? 'When there are new notifications, they will show up here.'
            : 'Adjust the filters to see other notifications.'}
        </p>
      </div>
    </div>
  );
}

export function DevPortalNotificationsPage() {
  const notificationsApi = useApi(notificationsApiRef);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);

  const { notifications, totalCount, loading, error, refresh } =
    useNotificationList(filters, offset, limit);
  const [refreshes, setRefreshes] = useState(0);
  const topics = useTopics(refreshes);

  const change = (update: Partial<FilterState>) => {
    setFilters(current => ({ ...current, ...update }));
    setOffset(0);
  };

  // The search waits for a pause in typing.
  useEffect(() => {
    if (search === filters.search) {
      return undefined;
    }
    const timeout = setTimeout(() => change({ search }), 300);
    return () => clearTimeout(timeout);
  }, [search, filters.search]);

  const changed = async (update: () => Promise<unknown>) => {
    await update();
    setRefreshes(value => value + 1);
    refresh();
    notifyNotificationsChanged();
  };

  const toggleRead = (notification: Notification) =>
    changed(() =>
      notificationsApi.updateNotifications({
        ids: [notification.id],
        read: !notification.read,
      }),
    );

  const toggleSaved = (notification: Notification) =>
    changed(() =>
      notificationsApi.updateNotifications({
        ids: [notification.id],
        saved: !notification.saved,
      }),
    );

  const markAllRead = () =>
    changed(async () => {
      const { notifications: unread } = await notificationsApi.getNotifications(
        { read: false, limit: 1000 },
      );
      if (unread.length) {
        await notificationsApi.updateNotifications({
          ids: unread.map(notification => notification.id),
          read: true,
        });
      }
    });

  let list;
  if (error) {
    list = (
      <p className={styles.message}>
        Could not load the notifications: {error.message}
      </p>
    );
  } else if (!loading && notifications.length === 0) {
    list = <EmptyState view={filters.view} />;
  } else {
    list = (
      <ul className={styles.list} aria-busy={loading}>
        {notifications.map(notification => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onToggleRead={toggleRead}
            onToggleSaved={toggleSaved}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.description}>
            Follow the updates of your services and of the platform.
          </p>
        </div>
        <SupportMenu variant="button" />
      </header>

      <div className={styles.body}>
        <aside className={styles.filters} aria-label="Filters">
          <h2 className={styles.filtersTitle}>Filters</h2>
          <FilterSelect
            label="Show"
            value={filters.view}
            options={[...VIEWS]}
            onChange={view => change({ view: view as ViewId })}
          />
          <FilterSelect
            label="Created"
            value={filters.period}
            options={[...PERIODS]}
            onChange={period => change({ period: period as PeriodId })}
          />
          <FilterSelect
            label="Sort by"
            value={filters.sort}
            options={[...SORTS]}
            onChange={sort => change({ sort: sort as SortId })}
          />
          <FilterSelect
            label="Minimum severity"
            value={filters.severity}
            options={[...SEVERITIES]}
            onChange={severity => change({ severity: severity as Severity })}
          />
          <FilterSelect
            label="Topic"
            value={filters.topic}
            options={[
              { id: ANY_TOPIC, label: 'Any topic' },
              ...topics.map(topic => ({ id: topic, label: topic })),
            ]}
            onChange={topic => change({ topic })}
          />
        </aside>

        <section className={styles.card}>
          <div className={styles.bar}>
            <h2 className={styles.heading}>
              {TITLES[filters.view]}
              <span className={styles.count}>{totalCount}</span>
            </h2>
            <div className={styles.tools}>
              {filters.view === 'unread' && totalCount > 0 && (
                <button
                  type="button"
                  className={styles.markAll}
                  onClick={markAllRead}
                >
                  Mark all as read
                </button>
              )}
              <div className={styles.search}>
                <SearchField
                  aria-label="Search notifications"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
            </div>
          </div>

          {list}

          <Pagination
            offset={offset}
            limit={limit}
            total={totalCount}
            noun="notifications"
            onOffsetChange={setOffset}
            onLimitChange={value => {
              setLimit(value);
              setOffset(0);
            }}
          />
        </section>
      </div>
    </>
  );
}
