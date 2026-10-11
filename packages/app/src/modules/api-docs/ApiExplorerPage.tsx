import { useEffect } from 'react';
import {
  EntityKindFilter,
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { AppIcon } from '@backstage/core-components';
import { EntityListCard } from '../entities/EntityListCard';
import {
  LifecycleSelect,
  OwnerSelect,
  TagSelect,
  TypeSelect,
} from '../entities/FilterSelects';
import { PageNote } from '../entities/PageNote';
import { SupportMenu } from '../entities/SupportMenu';
import { UserFilters } from '../entities/UserFilters';
import { columns, sortFields } from './columns';
import styles from './ApiExplorerPage.module.css';

const KIND = 'api';

function ApiExplorerBody() {
  const { updateFilters } = useEntityList();

  useEffect(() => {
    updateFilters({ kind: new EntityKindFilter(KIND, 'API') });
  }, [updateFilters]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>API explorer</h1>
          <p className={styles.description}>
            Explore the APIs, their owners and lifecycles.
          </p>
        </div>
        <SupportMenu variant="button" />
      </header>

      <div className={styles.body}>
        <div className={styles.layout}>
          <UserFilters
            scope={{ kind: KIND }}
            ownedLabel="My APIs"
            allIcon={<AppIcon id="kind:api" />}
            before={<TypeSelect scope={{ kind: KIND }} />}
            after={
              <>
                <OwnerSelect scope={{ kind: KIND }} />
                <LifecycleSelect scope={{ kind: KIND }} />
                <TagSelect scope={{ kind: KIND }} />
              </>
            }
          />
          <EntityListCard
            heading="All APIs"
            plural="APIs"
            searchPlaceholder="Filter APIs..."
            columns={columns}
            sortFields={sortFields}
            density="compact"
          />
        </div>
        <PageNote>
          The data of each API is defined in the catalog-info.yaml file of its
          repository.
        </PageNote>
      </div>
    </>
  );
}

export function DevPortalApiExplorerPage() {
  return (
    <EntityListProvider pagination={{ mode: 'offset', limit: 20 }}>
      <ApiExplorerBody />
    </EntityListProvider>
  );
}
