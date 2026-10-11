import { useEffect } from 'react';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import {
  DefaultEntityFilters,
  EntityFilter,
  EntityListProvider,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import BookIcon from '@material-ui/icons/MenuBookOutlined';
import { EntityListCard } from '../entities/EntityListCard';
import { OwnerSelect, TagSelect } from '../entities/FilterSelects';
import { SupportMenu } from '../entities/SupportMenu';
import { UserFilters } from '../entities/UserFilters';
import { columns } from './columns';
import styles from './DocsPage.module.css';

const TECHDOCS_ANNOTATION = 'backstage.io/techdocs-ref';
const SCOPE = { annotation: TECHDOCS_ANNOTATION };

/** Only entities that have documentation. */
class TechDocsFilter implements EntityFilter {
  getCatalogFilters() {
    return {
      [`metadata.annotations.${TECHDOCS_ANNOTATION}`]: CATALOG_FILTER_EXISTS,
    };
  }
}

function DocsBody() {
  const { updateFilters } = useEntityList<
    DefaultEntityFilters & { techdocs?: EntityFilter }
  >();

  useEffect(() => {
    updateFilters({ techdocs: new TechDocsFilter() });
  }, [updateFilters]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Documentation</h1>
          <p className={styles.description}>
            Explore the documentation of the components and find their owners.
          </p>
        </div>
        <SupportMenu variant="button" />
      </header>

      <div className={styles.body}>
        <UserFilters
          scope={SCOPE}
          ownedLabel="My documents"
          entitiesTitle="Documents"
          allIcon={<BookIcon />}
          after={
            <>
              <OwnerSelect scope={SCOPE} />
              <TagSelect scope={SCOPE} />
            </>
          }
        />
        <EntityListCard
          heading="All documents"
          plural="documents"
          searchPlaceholder="Filter documents..."
          columns={columns}
          sortFields={{}}
        />
      </div>
    </>
  );
}

export function DevPortalDocsPage() {
  return (
    <EntityListProvider pagination={{ mode: 'offset', limit: 20 }}>
      <DocsBody />
    </EntityListProvider>
  );
}
