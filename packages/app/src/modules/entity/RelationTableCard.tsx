import { ApiEntity, stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { apiDocsConfigRef } from '@backstage/plugin-api-docs';
import { useEntity, useRelatedEntities } from '@backstage/plugin-catalog-react';
import { Cell, ColumnConfig, Table } from '@backstage/ui';
import { Description, EntityLink, Lifecycle, Muted } from '../entities/cells';
import { EntityRow } from '../entities/EntityListCard';
import { DpCard, EmptyState } from './DpCard';
import { linkedCountLabel, relationTargets } from './entityInfo';
import { KindIcon } from './kindIcons';
import styles from './RelationTableCard.module.css';

function nameColumn(kind: string): ColumnConfig<EntityRow> {
  return {
    id: 'name',
    label: 'Name',
    isRowHeader: true,
    width: '1.5fr',
    cell: ({ entity }) => (
      <Cell>
        <span className={styles.name}>
          <KindIcon kind={kind} className={styles.nameIcon} />
          <EntityLink entityRef={entity} />
        </span>
      </Cell>
    ),
  };
}

const ownerColumn: ColumnConfig<EntityRow> = {
  id: 'owner',
  label: 'Owner',
  cell: ({ entity }) => {
    const owners = relationTargets(entity, 'ownedBy');
    return (
      <Cell>
        {owners.length > 0 ? (
          <span className={styles.owners}>
            {owners.map(owner => (
              <EntityLink
                key={stringifyEntityRef(owner)}
                entityRef={owner}
                className={styles.ownerLink}
              />
            ))}
          </span>
        ) : (
          <Muted />
        )}
      </Cell>
    );
  },
};

const typeColumn: ColumnConfig<EntityRow> = {
  id: 'type',
  label: 'Type',
  cell: ({ entity }) => (
    <Cell>
      {typeof entity.spec?.type === 'string' ? entity.spec.type : <Muted />}
    </Cell>
  ),
};

/** The type of an API, with the name its definition widget gives it ("OpenAPI"). */
function ApiType({ entity }: { entity: ApiEntity }) {
  const config = useApi(apiDocsConfigRef);
  return (
    <>{config.getApiDefinitionWidget(entity)?.title ?? entity.spec.type}</>
  );
}

const apiTypeColumn: ColumnConfig<EntityRow> = {
  id: 'type',
  label: 'Type',
  cell: ({ entity }) => (
    <Cell>
      {entity.kind === 'API' ? (
        <ApiType entity={entity as ApiEntity} />
      ) : (
        <Muted />
      )}
    </Cell>
  ),
};

const lifecycleColumn: ColumnConfig<EntityRow> = {
  id: 'lifecycle',
  label: 'Lifecycle',
  cell: ({ entity }) => (
    <Cell>
      <Lifecycle value={entity.spec?.lifecycle} />
    </Cell>
  ),
};

const descriptionColumn: ColumnConfig<EntityRow> = {
  id: 'description',
  label: 'Description',
  width: '1.5fr',
  cell: ({ entity }) => (
    <Cell>
      <Description entity={entity} truncate />
    </Cell>
  ),
};

/** The columns each kind of related entity gets, in the order of the design. */
const COLUMNS: Record<string, (kind: string) => ColumnConfig<EntityRow>[]> = {
  // Name, owner, type and lifecycle.
  resource: kind => [
    nameColumn(kind),
    ownerColumn,
    typeColumn,
    lifecycleColumn,
  ],
  // The same, plus the description.
  component: kind => [
    nameColumn(kind),
    ownerColumn,
    typeColumn,
    lifecycleColumn,
    descriptionColumn,
  ],
  // APIs: the type is the one of the definition (OpenAPI, gRPC...).
  api: kind => [
    nameColumn(kind),
    ownerColumn,
    apiTypeColumn,
    lifecycleColumn,
    descriptionColumn,
  ],
  // Systems and domains have no type or lifecycle.
  organization: kind => [nameColumn(kind), ownerColumn, descriptionColumn],
};

export interface RelationTableCardProps {
  title: string;
  /** Relation of the current entity to the listed ones ("dependsOn", "hasPart"...). */
  relationType: string;
  /** Kind of the listed entities, used for the icon and to filter the relation. */
  kind: string;
  columns: keyof typeof COLUMNS;
  /** Singular and plural of what is listed, for the footer ("resource", "resources"). */
  noun: [singular: string, plural: string];
  emptyMessage: string;
}

/**
 * A card listing the entities related to the current one (depends on, has
 * part...) in a table, with a count in the header and a summary below.
 */
export function RelationTableCard({
  title,
  relationType,
  kind,
  columns,
  noun,
  emptyMessage,
}: RelationTableCardProps) {
  const { entity } = useEntity();
  const { entities, loading, error } = useRelatedEntities(entity, {
    type: relationType,
    kind,
  });

  const rows: EntityRow[] = (entities ?? []).map(related => ({
    id: stringifyEntityRef(related),
    entity: related,
  }));
  const count = loading || error ? undefined : rows.length;

  return (
    <DpCard
      icon={<KindIcon kind={kind} />}
      title={title}
      count={count}
      flush
      footer={count ? linkedCountLabel(count, noun[0], noun[1]) : undefined}
    >
      <div className={styles.table}>
        <Table<EntityRow>
          columnConfig={COLUMNS[columns](kind)}
          data={rows}
          isPending={loading}
          error={error}
          pagination={{ type: 'none' }}
          emptyState={
            <EmptyState icon={<KindIcon kind={kind} />}>
              {emptyMessage}
            </EmptyState>
          }
        />
      </div>
    </DpCard>
  );
}
