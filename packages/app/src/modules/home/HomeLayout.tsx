import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { HomePageLayoutProps } from '@backstage/plugin-home-react/alpha';
import SearchIcon from '@material-ui/icons/Search';
import { useProfile } from '../../hooks/useProfile';
import { SupportMenu } from '../entities/SupportMenu';
import styles from './HomeLayout.module.css';

// Where each widget goes. The cells line up the rows of the middle and right
// columns, the first column spans all of them.
const AREAS: Record<string, string> = {
  GettingStarted: 'start',
  HomePageStarredEntities: 'starred',
  HomePageRandomJoke: 'joke',
  HomePageToolkit: 'toolkit',
  HomePageWorldClock: 'clock',
  HomePageMostVisited: 'visited',
  HomePageRecentlyVisited: 'recent',
};

/** Widgets that the page does not draw: the search is part of the header. */
const HIDDEN = ['HomePageSearchBar'];

function HomeHeader() {
  const profile = useProfile();
  const navigate = useNavigate();
  const organization =
    useApi(configApiRef).getOptionalString('organization.name') ?? 'Backstage';

  return (
    <header className={styles.header}>
      <div className={styles.welcome}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>
            {profile ? `Olá, ${profile.name}!` : 'Olá!'}
          </h1>
          <p className={styles.description}>
            Seu ponto de partida para desenvolver, explorar e encontrar o que
            precisa no Backstage.
          </p>
        </div>
        <SupportMenu variant="button" />
      </div>
      <div className={styles.searchBand}>
        <button
          type="button"
          className={styles.search}
          onClick={() => navigate('/search')}
        >
          <SearchIcon className={styles.searchIcon} />
          <span className={styles.searchLabel}>Buscar no {organization}</span>
          <kbd className={styles.shortcut}>⌘ K</kbd>
        </button>
      </div>
    </header>
  );
}

export function HomeLayout({ widgets }: HomePageLayoutProps) {
  const shown = widgets.filter(widget => !HIDDEN.includes(widget.name ?? ''));
  const known = shown.filter(widget => widget.name && AREAS[widget.name]);
  const others = shown.filter(widget => !widget.name || !AREAS[widget.name]);

  const cell = (widget: { name?: string; component: ReactNode }) => (
    <div
      key={widget.name}
      className={styles.cell}
      style={{ gridArea: AREAS[widget.name ?? ''] }}
    >
      {widget.component}
    </div>
  );

  return (
    <>
      <HomeHeader />
      <div className={styles.content}>
        <div className={styles.grid}>{known.map(cell)}</div>
        {others.length > 0 && (
          <div className={styles.others}>
            {others.map((widget, index) => (
              <div key={widget.name ?? index}>{widget.component}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
