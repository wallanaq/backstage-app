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
          <h1 className={styles.title}>Explorador de APIs</h1>
          <p className={styles.description}>
            Explore as APIs, seus responsáveis e ciclos de vida.
          </p>
        </div>
        <SupportMenu variant="button" />
      </header>

      <div className={styles.body}>
        <div className={styles.layout}>
          <UserFilters
            scope={{ kind: KIND }}
            ownedLabel="Minhas APIs"
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
            heading="Todas as APIs"
            plural="APIs"
            searchPlaceholder="Filtrar APIs..."
            columns={columns}
            sortFields={sortFields}
            density="compact"
          />
        </div>
        <PageNote>
          Os dados de cada API são definidos no arquivo catalog-info.yaml do seu
          repositório.
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
