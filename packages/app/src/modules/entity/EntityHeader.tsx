import { Link, useNavigate } from 'react-router-dom';
import { Entity } from '@backstage/catalog-model';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import {
  scmIntegrationsApiRef,
  ScmIntegrationIcon,
} from '@backstage/integration-react';
import {
  entityRouteRef,
  getEntitySourceLocation,
  useAsyncEntity,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import { EntityHeaderLayoutProps } from '@backstage/plugin-catalog-react/alpha';
import {
  Button,
  ButtonIcon,
  ButtonLink,
  Menu,
  MenuItem,
  MenuTrigger,
} from '@backstage/ui';
import DescriptionIcon from '@material-ui/icons/Description';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { EntityLink, FavoriteButton, Lifecycle } from '../entities/cells';
import layout from '../nav/PageLayout.module.css';
import { TopBar } from '../nav/PageLayout';
import {
  hierarchy,
  kindListPage,
  kindPlural,
  relationTargets,
} from './entityInfo';
import { EntityMenuItemView, useMenuItems } from './MenuItems';
import styles from './EntityHeader.module.css';

type Tab = EntityHeaderLayoutProps['tabs'][number];

// Tabs come from the plugins with English titles.
const TAB_LABELS: Record<string, string> = {
  Overview: 'Visão geral',
  TechDocs: 'Docs',
  APIs: 'API',
  Definition: 'Definição',
  Dependencies: 'Dependências',
  Documentation: 'Documentação',
  Development: 'Desenvolvimento',
  Deployment: 'Implantação',
  Observability: 'Observabilidade',
};

const tabLabel = (label: string) => TAB_LABELS[label] ?? label;

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('en-US') + value.slice(1);
}

function RefList({
  label,
  refs,
}: {
  label: string;
  refs: Parameters<typeof EntityLink>[0]['entityRef'][];
}) {
  return (
    <div className={styles.metaItem}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>
        {refs.map((ref, index) => (
          <span key={index}>
            {index > 0 && ', '}
            <EntityLink entityRef={ref} className={styles.metaLink} />
          </span>
        ))}
      </span>
    </div>
  );
}

function Metadata({ entity }: { entity: Entity }) {
  const lifecycle = entity.spec?.lifecycle;
  const owners = relationTargets(entity, 'ownedBy');

  return (
    <div className={styles.meta}>
      {typeof lifecycle === 'string' && lifecycle && (
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Ciclo de vida</span>
          <Lifecycle value={lifecycle} />
        </div>
      )}
      {owners.length > 0 && <RefList label="Responsável" refs={owners} />}
      {hierarchy(entity).map(group => (
        <RefList key={group.label} label={group.label} refs={group.refs} />
      ))}
    </div>
  );
}

function SourceButton({ entity }: { entity: Entity }) {
  const scmIntegrations = useApi(scmIntegrationsApiRef);
  const source = getEntitySourceLocation(entity, scmIntegrations);

  if (!source) {
    return null;
  }
  return (
    <ButtonLink
      className={`${styles.button} ${styles.secondary}`}
      variant="secondary"
      size="medium"
      href={source.locationTargetUrl}
      target="_blank"
      iconStart={<ScmIntegrationIcon type={source.integrationType} />}
    >
      Código-fonte
    </ButtonLink>
  );
}

function ContextMenu({ entity }: { entity: Entity }) {
  const items = useMenuItems().filter(item => item.filter(entity));

  if (items.length === 0) {
    return null;
  }
  return (
    <MenuTrigger>
      <ButtonIcon
        className={styles.menuButton}
        variant="tertiary"
        icon={<MoreVertIcon />}
        aria-label="Mais ações"
      />
      <Menu placement="bottom end">
        {items.map(item => (
          <EntityMenuItemView key={item.node.spec.id} item={item} />
        ))}
      </Menu>
    </MenuTrigger>
  );
}

function TabLink({
  tab,
  base,
  active,
}: {
  tab: Extract<Tab, { href: string }>;
  base: string;
  active: boolean;
}) {
  return (
    <Link
      to={tab.href ? `${base}/${tab.href}` : base}
      className={active ? `${layout.tab} ${layout.tabActive}` : layout.tab}
      aria-current={active ? 'page' : undefined}
    >
      {tabLabel(tab.label)}
    </Link>
  );
}

function TabGroup({
  tab,
  base,
  activeTabId,
}: {
  tab: Extract<Tab, { items: unknown }>;
  base: string;
  activeTabId?: string;
}) {
  const navigate = useNavigate();
  const active = tab.items.some(item => item.id === activeTabId);

  return (
    <MenuTrigger>
      <Button
        variant="tertiary"
        className={
          active
            ? `${styles.groupTab} ${styles.groupTabActive}`
            : styles.groupTab
        }
        iconEnd={<ExpandMoreIcon />}
      >
        {tabLabel(tab.label)}
      </Button>
      <Menu placement="bottom start">
        {tab.items.map(item => (
          <MenuItem
            key={item.id}
            onAction={() => navigate(item.href ? `${base}/${item.href}` : base)}
          >
            {tabLabel(item.label)}
          </MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  );
}

/**
 * The header of the entity page, for every kind: top bar with the breadcrumbs,
 * the identity of the entity, its actions and the tabs of the page.
 */
export function DevPortalEntityHeader({
  tabs,
  activeTabId,
}: EntityHeaderLayoutProps) {
  const { entity } = useAsyncEntity();
  const params = useRouteRefParams(entityRouteRef);
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entity ?? params);

  const base = entityRoute(params).replace(/\/$/, '');
  const kind = entity?.kind ?? capitalize(params.kind);
  const namespace = entity?.metadata.namespace ?? params.namespace;
  const hasDocs = Boolean(
    entity?.metadata.annotations?.['backstage.io/techdocs-ref'],
  );

  const crumbs = [
    { label: 'Catálogo', href: '/catalog' },
    { label: kindPlural(kind), href: kindListPage(kind) },
    { label: primaryTitle, href: base },
  ];

  return (
    <div className={styles.root} data-dp-entity-header>
      <TopBar crumbs={crumbs} />

      <header className={styles.identity}>
        <div className={styles.main}>
          <p className={styles.kicker}>
            {kind} · {namespace}
          </p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{primaryTitle}</h1>
            {entity && <FavoriteButton entity={entity} />}
          </div>
          {entity && <Metadata entity={entity} />}
        </div>

        {entity && (
          <div className={styles.actions}>
            <SourceButton entity={entity} />
            {hasDocs && (
              <ButtonLink
                className={styles.button}
                variant="primary"
                size="medium"
                href={`${base}/docs`}
                iconStart={<DescriptionIcon />}
              >
                TechDocs
              </ButtonLink>
            )}
            <ContextMenu entity={entity} />
          </div>
        )}
      </header>

      {tabs.length > 0 && (
        <nav aria-label="Seções da entidade" className={layout.tabs}>
          {tabs.map(tab =>
            'items' in tab ? (
              <TabGroup
                key={tab.id}
                tab={tab}
                base={base}
                activeTabId={activeTabId}
              />
            ) : (
              <TabLink
                key={tab.id}
                tab={tab}
                base={base}
                active={tab.id === activeTabId}
              />
            ),
          )}
        </nav>
      )}
    </div>
  );
}
