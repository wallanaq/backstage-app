import { useMemo } from 'react';
import { NavLink, useResolvedPath } from 'react-router-dom';
import {
  BreadcrumbEntry,
  PageLayout,
  PageLayoutProps,
  useBreadcrumbEntries,
} from '@backstage/frontend-plugin-api';
import { SwappableComponentBlueprint } from '@backstage/plugin-app-react';
import HomeIcon from '@material-ui/icons/HomeOutlined';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { SupportMenu } from '../entities/SupportMenu';
import { useUnreadCount } from '../notifications/useUnreadCount';
import styles from './PageLayout.module.css';

// Plugins register their page titles in English.
const TITLES: Record<string, string> = {
  Home: 'Início',
  Docs: 'Documentação',
  Catalog: 'Catálogo',
  Create: 'Criar',
  Search: 'Busca',
  Settings: 'Configurações',
  Notifications: 'Notificações',
};

const translate = (label: string) => TITLES[label] ?? label;

// Pages that live under the catalog in the DevPortal design.
const CATALOG_CRUMB = { label: 'Catalog', href: '/catalog' };
const UNDER_CATALOG = ['/api-docs'];

// The tabs shown for a page (by route) and their order, by sub page path.
// Other sub pages are not listed in the tabs, but can still be opened by URL.
const VISIBLE_TABS: Record<string, string[]> = {
  '/create': ['templates', 'tasks', 'editor'],
  '/settings': ['general', 'profile', 'identity', 'appearance'],
};

// Pages with a title block between the top bar and the tabs, by route.
const HEADERS: Record<string, { title: string; description: string }> = {
  '/create': {
    title: 'Criar um novo componente',
    description:
      'Escolha um template para começar com os padrões e boas práticas da organização.',
  },
  '/settings': {
    title: 'Configurações',
    description:
      'Consulte seu perfil e sua identidade no Backstage e personalize a aparência do portal.',
  },
};

function PageHeader({
  title,
  description,
  bordered,
}: {
  title: string;
  description: string;
  bordered: boolean;
}) {
  return (
    <header
      className={
        bordered ? `${styles.header} ${styles.bordered}` : styles.header
      }
    >
      <div>
        <h1 className={styles.headerTitle}>{title}</h1>
        <p className={styles.headerDescription}>{description}</p>
      </div>
      <SupportMenu variant="button" />
    </header>
  );
}

function NotificationsButton() {
  const unread = useUnreadCount();

  return (
    <NavLink
      to="/notifications"
      className={({ isActive }) =>
        isActive
          ? `${styles.iconButton} ${styles.iconButtonActive}`
          : styles.iconButton
      }
      aria-label={
        unread ? `Notificações (${unread} não lidas)` : 'Notificações'
      }
    >
      <NotificationsIcon />
      {unread ? <span className={styles.badge} aria-hidden /> : null}
    </NavLink>
  );
}

function TopBar({ headerActions }: Pick<PageLayoutProps, 'headerActions'>) {
  const { items: registered } = useBreadcrumbEntries();
  const items = UNDER_CATALOG.includes(registered[0]?.href ?? '')
    ? [CATALOG_CRUMB, ...registered]
    : registered;

  return (
    <div className={styles.topBar}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <NavLink to="/" className={styles.home} aria-label="Início">
          <HomeIcon />
        </NavLink>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.href}-${item.label}`} className={styles.crumb}>
              <span className={styles.separator} aria-hidden>
                /
              </span>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {translate(item.label)}
                </span>
              ) : (
                <NavLink to={item.href} className={styles.crumbLink}>
                  {translate(item.label)}
                </NavLink>
              )}
            </span>
          );
        })}
      </nav>
      <div className={styles.actions}>
        {headerActions}
        <a
          className={styles.docsLink}
          href="https://backstage.io/docs"
          target="_blank"
          rel="noreferrer"
        >
          Documentação do Backstage
          <OpenInNewIcon className={styles.docsIcon} />
        </a>
        <NotificationsButton />
      </div>
    </div>
  );
}

function DevPortalPageLayout(props: PageLayoutProps) {
  const { title, noHeader, titleLink, headerActions, tabs, children } = props;
  const parentPath = useResolvedPath('.').pathname.replace(/\/$/, '');

  const resolvedTabs = useMemo(() => {
    const visible = titleLink ? VISIBLE_TABS[titleLink] : undefined;
    const shown = visible
      ? visible.flatMap(id => tabs?.filter(tab => tab.id === id) ?? [])
      : tabs;
    return shown?.map(tab => ({
      ...tab,
      href: tab.href.startsWith('/')
        ? tab.href
        : `${parentPath}/${tab.href}`.replace(/\/{2,}/g, '/'),
    }));
  }, [tabs, titleLink, parentPath]);

  if (noHeader) {
    return <>{children}</>;
  }

  const header = titleLink ? HEADERS[titleLink] : undefined;

  const content = (
    <>
      <TopBar headerActions={headerActions} />
      {header && (
        <PageHeader
          {...header}
          bordered={!resolvedTabs || resolvedTabs.length === 0}
        />
      )}
      {resolvedTabs && resolvedTabs.length > 0 && (
        <nav aria-label="Seções" className={styles.tabs}>
          {resolvedTabs.map(tab => (
            <NavLink
              key={tab.id}
              to={tab.href}
              className={({ isActive }) =>
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
      {children}
    </>
  );

  if (!title) {
    return content;
  }
  return (
    <BreadcrumbEntry
      entry={{ label: title, href: titleLink ?? (parentPath || '/') }}
    >
      {content}
    </BreadcrumbEntry>
  );
}

/** Replaces the app's BUI `PluginHeader` based page layout. */
export const DevPortalPageLayoutExtension = SwappableComponentBlueprint.make({
  name: 'core-page-layout',
  params: define =>
    define({
      component: PageLayout,
      loader: () => DevPortalPageLayout,
    }),
});
