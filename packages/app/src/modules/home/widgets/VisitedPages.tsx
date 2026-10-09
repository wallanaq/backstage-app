import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { Visit, VisitsApi, visitsApiRef } from '@backstage/plugin-home';
import ChartIcon from '@material-ui/icons/BarChart';
import CodeIcon from '@material-ui/icons/Code';
import HistoryIcon from '@material-ui/icons/History';
import HomeIcon from '@material-ui/icons/HomeOutlined';
import LayersIcon from '@material-ui/icons/Layers';
import LinkIcon from '@material-ui/icons/Link';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import { WidgetCard } from '../WidgetCard';
import styles from './VisitedPages.module.css';

const PAGE_ICONS: [string, ReactNode][] = [
  ['/settings', <SettingsIcon />],
  ['/catalog', <LayersIcon />],
  ['/api-docs', <CodeIcon />],
  ['/docs', <BookIcon />],
  ['/create', <AddIcon />],
  ['/home', <HomeIcon />],
];

function iconFor(pathname: string): ReactNode {
  if (pathname === '/') {
    return <HomeIcon />;
  }
  return (
    PAGE_ICONS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? (
      <LinkIcon />
    )
  );
}

const times = (hits: number) => `${hits} ${hits === 1 ? 'vez' : 'vezes'}`;

function useVisits(query: Parameters<VisitsApi['list']>[0]) {
  const visitsApi = useApi(visitsApiRef);
  const [visits, setVisits] = useState<Visit[]>([]);
  const key = JSON.stringify(query);

  useEffect(() => {
    let cancelled = false;
    visitsApi
      .list(JSON.parse(key))
      .then(items => {
        if (!cancelled) setVisits(items);
      })
      .catch(() => {
        // Visit tracking is optional; the widget stays empty without it.
      });
    return () => {
      cancelled = true;
    };
  }, [visitsApi, key]);

  return visits;
}

function VisitList({
  visits,
  showHits,
}: {
  visits: Visit[];
  showHits: boolean;
}) {
  if (visits.length === 0) {
    return (
      <p className={styles.empty}>
        Nenhuma página visitada ainda. Navegue pelo portal e ela aparece aqui.
      </p>
    );
  }
  return (
    <ul className={styles.list}>
      {visits.map(visit => (
        <li key={visit.id} className={styles.row}>
          <span className={styles.rowIcon}>{iconFor(visit.pathname)}</span>
          <Link className={styles.rowText} to={visit.pathname}>
            <span className={styles.rowName}>{visit.name}</span>
            <span className={styles.rowPath}>{visit.pathname}</span>
          </Link>
          {showHits && <span className={styles.hits}>{times(visit.hits)}</span>}
        </li>
      ))}
    </ul>
  );
}

const PREVIEW = 3;
const EXPANDED = 8;

export function MostVisited() {
  const [expanded, setExpanded] = useState(false);
  const visits = useVisits({
    limit: EXPANDED,
    orderBy: [{ field: 'hits', direction: 'desc' }],
  });

  return (
    <WidgetCard icon={<ChartIcon />} title="Mais visitados">
      <VisitList
        visits={expanded ? visits : visits.slice(0, PREVIEW)}
        showHits
      />
      {visits.length > PREVIEW && (
        <div className={styles.more}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => setExpanded(value => !value)}
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
      )}
    </WidgetCard>
  );
}

export function RecentlyVisited() {
  const visits = useVisits({
    limit: PREVIEW,
    orderBy: [{ field: 'timestamp', direction: 'desc' }],
  });

  return (
    <WidgetCard icon={<HistoryIcon />} title="Visitados recentemente">
      <VisitList visits={visits} showHits={false} />
    </WidgetCard>
  );
}
