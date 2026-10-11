import { useEffect, useState } from 'react';
import { BreadcrumbEntry } from '@backstage/frontend-plugin-api';
import { useRouteRef } from '@backstage/core-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import {
  EntityKindFilter,
  EntityListProvider,
  EntityTypeFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { usePermission } from '@backstage/plugin-permission-react';
import { ButtonLink } from '@backstage/ui';
import AddIcon from '@material-ui/icons/Add';
import LayersIcon from '@material-ui/icons/Layers';
import { useProfile } from '../../hooks/useProfile';
import { EntityListCard } from '../entities/EntityListCard';
import { PageNote } from '../entities/PageNote';
import { SupportMenu } from '../entities/SupportMenu';
import { UserFilters } from '../entities/UserFilters';
import { columns, sortFields } from './columns';
import styles from './CatalogPage.module.css';

// Tabs map to the `spec.type` of components.
const CATEGORIES = [
  { type: 'service', label: 'Services', plural: 'services' },
  { type: 'website', label: 'Websites', plural: 'websites' },
  { type: 'library', label: 'Libraries', plural: 'libraries' },
  { type: 'documentation', label: 'Documentation', plural: 'documentation' },
  { type: 'other', label: 'Others', plural: 'other components' },
];

/** Component type selected on the tabs, kept in sync with the entity list. */
function useCategory() {
  const { queryParameters, updateFilters } = useEntityList();
  const typeFromUrl = [queryParameters.type].flat().filter(Boolean)[0];
  const [type, setType] = useState(
    CATEGORIES.some(category => category.type === typeFromUrl)
      ? (typeFromUrl as string)
      : CATEGORIES[0].type,
  );

  useEffect(() => {
    updateFilters({
      kind: new EntityKindFilter('component', 'Component'),
      type: new EntityTypeFilter(type),
    });
  }, [type, updateFilters]);

  return { category: CATEGORIES.find(c => c.type === type)!, setType };
}

function CreateButton() {
  const createComponent = useRouteRef(
    catalogPlugin.externalRoutes.createComponent,
  );
  const { allowed } = usePermission({
    permission: catalogEntityCreatePermission,
  });
  const href = createComponent?.();

  if (!allowed || !href) {
    return null;
  }
  return (
    <ButtonLink variant="primary" href={href} iconStart={<AddIcon />}>
      Create component
    </ButtonLink>
  );
}

function CatalogPageBody() {
  const profile = useProfile();
  const { category, setType } = useCategory();

  return (
    <BreadcrumbEntry entry={{ label: category.label, href: '' }}>
      <header className={styles.welcome}>
        <h1 className={styles.greeting}>
          {profile ? `Hello, ${profile.name}!` : 'Hello!'}
        </h1>
        <p className={styles.greetingText}>
          Your starting point to explore the service catalog.
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Categories">
        {CATEGORIES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={type === category.type}
            className={
              type === category.type
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div>
            <h2 className={styles.title}>{category.label}</h2>
            <p className={styles.description}>
              Explore the components, their owners and lifecycles.
            </p>
          </div>
          <div className={styles.actions}>
            <CreateButton />
            <SupportMenu variant="icon" />
          </div>
        </div>

        <div className={styles.layout}>
          <UserFilters
            scope={{ kind: 'component', type: category.type }}
            ownedLabel={`My ${category.plural}`}
            allIcon={<LayersIcon />}
          />
          <EntityListCard
            heading={`All ${category.plural}`}
            plural={category.plural}
            searchPlaceholder={`Search ${category.plural}...`}
            columns={columns}
            sortFields={sortFields}
          />
        </div>
        <PageNote>
          The data of each service is defined in the catalog-info.yaml file of
          its repository.
        </PageNote>
      </div>
    </BreadcrumbEntry>
  );
}

export interface DevPortalCatalogPageProps {
  pagination?: Parameters<typeof EntityListProvider>[0]['pagination'];
}

export function DevPortalCatalogPage({
  pagination,
}: DevPortalCatalogPageProps) {
  return (
    <EntityListProvider pagination={pagination}>
      <CatalogPageBody />
    </EntityListProvider>
  );
}
