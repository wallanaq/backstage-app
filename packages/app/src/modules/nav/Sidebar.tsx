import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import {
  NavContentBlueprint,
  NavContentNavItem,
} from '@backstage/plugin-app-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import SearchIcon from '@material-ui/icons/Search';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import { useProfile } from '../../hooks/useProfile';
import { useUnreadCount } from '../notifications/useUnreadCount';
import styles from './Sidebar.module.css';

// Page extension ids -> label shown in the sidebar (falls back to the
// title the plugin registered).
const LABELS: Record<string, string> = {
  'page:home': 'Home',
  'page:catalog': 'Catalog',
  'page:api-docs': 'APIs',
  'page:techdocs': 'Documentation',
  'page:scaffolder': 'Create component',
  'page:notifications': 'Notifications',
  'page:user-settings': 'Settings',
};

const WORKSPACE = [
  'page:home',
  'page:catalog',
  'page:api-docs',
  'page:techdocs',
  'page:scaffolder',
  'page:notifications',
];
const FOOTER = ['page:user-settings'];

// Pages that exist but are not offered in the menu. They can still be opened
// by URL (/catalog-graph, /catalog-import, /visualizer).
const HIDDEN = [
  'page:catalog-graph',
  'page:catalog-import',
  'page:app-visualizer',
];

function useCatalogCount(enabled: boolean) {
  const catalogApi = useApi(catalogApiRef);
  const [count, setCount] = useState<number>();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let cancelled = false;
    catalogApi
      .queryEntities({ limit: 1, filter: { kind: 'component' } })
      .then(response => {
        if (!cancelled) setCount(response.totalItems);
      })
      .catch(() => {
        // The count is decoration, the link still works without it.
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi, enabled]);

  return count;
}

function CatalogCount() {
  const count = useCatalogCount(true);
  return count === undefined ? null : (
    <span className={styles.itemCount}>{count}</span>
  );
}

function NotificationsCount() {
  const unread = useUnreadCount();
  return unread === undefined ? null : (
    <span className={styles.itemCount}>{unread}</span>
  );
}

/** The counter shown at the end of some of the items. */
function ItemCount({ id }: { id: string }) {
  if (id === 'page:catalog') return <CatalogCount />;
  if (id === 'page:notifications') return <NotificationsCount />;
  return null;
}

function DevPortalNavItem({ node, href, title, icon }: NavContentNavItem) {
  const id = node.spec.id;

  return (
    <NavLink
      to={href}
      end={href === '/'}
      className={({ isActive }) =>
        isActive ? `${styles.item} ${styles.itemActive}` : styles.item
      }
    >
      <span className={styles.itemIcon}>{icon}</span>
      <span className={styles.itemLabel}>{LABELS[id] ?? title}</span>
      <ItemCount id={id} />
    </NavLink>
  );
}

function Brand() {
  return (
    <NavLink to="/" className={styles.brand} aria-label="Home">
      <span className={styles.brandSymbol} aria-hidden>
        <span style={{ height: 18 }} />
        <span style={{ height: 30 }} />
        <span style={{ height: 23 }} />
      </span>
      <span className={styles.brandName}>backstage</span>
    </NavLink>
  );
}

function SearchButton({ href }: { href: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname === href;

  const open = useCallback(() => {
    if (active) {
      // Already on the page: keep the search and put the cursor in the field.
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    } else {
      navigate(href);
    }
  }, [active, navigate, href]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <button
      type="button"
      className={
        active ? `${styles.search} ${styles.searchActive}` : styles.search
      }
      aria-current={active ? 'page' : undefined}
      onClick={open}
    >
      <SearchIcon className={styles.searchIcon} />
      <span className={styles.searchLabel}>Search</span>
      <kbd className={styles.searchShortcut}>⌘ K</kbd>
    </button>
  );
}

function Account({ href }: { href?: string }) {
  const profile = useProfile();

  const content = (
    <>
      <span className={styles.avatar} aria-hidden>
        {profile?.name.charAt(0).toUpperCase()}
      </span>
      <span className={styles.accountText}>
        <span className={styles.accountName}>{profile?.name}</span>
        <span className={styles.accountSubtitle}>{profile?.subtitle}</span>
      </span>
      <UnfoldMoreIcon className={styles.accountChevron} />
    </>
  );

  return href ? (
    <NavLink to={href} className={styles.account}>
      {content}
    </NavLink>
  ) : (
    <div className={styles.account}>{content}</div>
  );
}

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      // `navItems` is shared across renders, so work on a copy to be able to
      // `take` items every time this component renders.
      const bag = navItems.clone();
      const searchHref = bag.take('page:search')?.href;
      HIDDEN.forEach(id => bag.take(id));
      const nav = bag.withComponent(DevPortalNavItem);

      const workspace = WORKSPACE.map(id => nav.take(id));
      const footer = FOOTER.map(id => nav.take(id));
      const organization = nav.rest({ sortBy: 'title' });
      // Already taken above; `take` still returns the item.
      const settingsHref = bag.take('page:user-settings')?.href;

      return (
        <nav className={styles.root} aria-label="Main navigation">
          <Brand />
          {searchHref && <SearchButton href={searchHref} />}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Workspace</div>
            {workspace}
          </div>

          {organization.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Organization</div>
              {organization}
            </div>
          )}

          <div className={styles.spacer} />

          <div className={styles.footer}>
            <div className={styles.footerLinks}>{footer}</div>
            <Account href={settingsHref} />
          </div>
        </nav>
      );
    },
  },
});
