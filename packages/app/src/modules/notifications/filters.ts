import { GetNotificationsOptions } from '@backstage/plugin-notifications';

export type Severity = NonNullable<GetNotificationsOptions['minimumSeverity']>;

export interface Option<T extends string = string> {
  id: T;
  label: string;
}

export const VIEWS = [
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
  { id: 'saved', label: 'Saved' },
  { id: 'all', label: 'All' },
] as const satisfies readonly Option[];

export const PERIODS = [
  { id: 'any', label: 'Any time' },
  { id: 'day', label: 'Last 24 hours' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'Last 30 days' },
] as const satisfies readonly Option[];

export const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'topic', label: 'Topic' },
  { id: 'origin', label: 'Origin' },
] as const satisfies readonly Option[];

export const SEVERITIES = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
] as const satisfies readonly Option<Severity>[];

export type ViewId = (typeof VIEWS)[number]['id'];
export type PeriodId = (typeof PERIODS)[number]['id'];
export type SortId = (typeof SORTS)[number]['id'];

export const ANY_TOPIC = 'any';

const PERIOD_MS: Record<Exclude<PeriodId, 'any'>, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

export interface FilterState {
  view: ViewId;
  period: PeriodId;
  sort: SortId;
  severity: Severity;
  topic: string;
  search: string;
}

export const DEFAULT_FILTERS: FilterState = {
  view: 'unread',
  period: 'any',
  sort: 'newest',
  severity: 'low',
  topic: ANY_TOPIC,
  search: '',
};

/** Options of the `getNotifications` call that the filters stand for. */
export function toQuery(
  filters: FilterState,
  now = Date.now(),
): Omit<GetNotificationsOptions, 'offset' | 'limit'> {
  const sort = {
    newest: { sort: 'created', sortOrder: 'desc' },
    oldest: { sort: 'created', sortOrder: 'asc' },
    topic: { sort: 'topic', sortOrder: 'asc' },
    origin: { sort: 'origin', sortOrder: 'asc' },
  } as const;

  return {
    ...(filters.view === 'unread' && { read: false }),
    ...(filters.view === 'read' && { read: true }),
    ...(filters.view === 'saved' && { saved: true }),
    ...(filters.period !== 'any' && {
      createdAfter: new Date(now - PERIOD_MS[filters.period]),
    }),
    ...(filters.severity !== 'low' && { minimumSeverity: filters.severity }),
    ...(filters.topic !== ANY_TOPIC && { topic: filters.topic }),
    ...(filters.search && { search: filters.search }),
    ...sort[filters.sort],
  };
}

export const TITLES: Record<ViewId, string> = {
  unread: 'Unread notifications',
  read: 'Read notifications',
  saved: 'Saved notifications',
  all: 'All notifications',
};
