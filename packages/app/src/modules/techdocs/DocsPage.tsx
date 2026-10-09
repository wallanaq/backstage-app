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
          <h1 className={styles.title}>Documentação</h1>
          <p className={styles.description}>
            Explore a documentação dos componentes e encontre seus responsáveis.
          </p>
        </div>
        <SupportMenu variant="button" />
      </header>

      <div className={styles.body}>
        <UserFilters
          scope={SCOPE}
          ownedLabel="Meus documentos"
          entitiesTitle="Documentos"
          allIcon={<BookIcon />}
          after={
            <>
              <OwnerSelect scope={SCOPE} />
              <TagSelect scope={SCOPE} />
            </>
          }
        />
        <EntityListCard
          heading="Todos os documentos"
          plural="documentos"
          searchPlaceholder="Filtrar documentos..."
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
