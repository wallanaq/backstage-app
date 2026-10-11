import { Link } from 'react-router-dom';
import { Entity, RELATION_OWNED_BY } from '@backstage/catalog-model';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  getEntityRelations,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import { Cell, ColumnConfig } from '@backstage/ui';
import PeopleIcon from '@material-ui/icons/PeopleOutline';
import PersonIcon from '@material-ui/icons/PersonOutline';
import { EntityLink, FavoriteButton, Muted } from '../entities/cells';
import { EntityRow } from '../entities/EntityListCard';
import styles from './columns.module.css';

function DocLink({ entity }: { entity: Entity }) {
  const docRoute = useRouteRef(techdocsPlugin.routes.docRoot);
  const { primaryTitle } = useEntityPresentation(entity);

  return (
    <Link
      className={styles.docLink}
      to={docRoute({
        namespace: (entity.metadata.namespace ?? 'default').toLocaleLowerCase(
          'en-US',
        ),
        kind: entity.kind.toLocaleLowerCase('en-US'),
        name: entity.metadata.name,
      })}
    >
      {primaryTitle}
    </Link>
  );
}

function Owner({ entity }: { entity: Entity }) {
  const [owner] = getEntityRelations(entity, RELATION_OWNED_BY);
  if (!owner) {
    return <Muted />;
  }
  return (
    <span className={styles.owner}>
      {owner.kind.toLocaleLowerCase('en-US') === 'user' ? (
        <PersonIcon />
      ) : (
        <PeopleIcon />
      )}
      <EntityLink entityRef={owner} />
    </span>
  );
}

export const columns: ColumnConfig<EntityRow>[] = [
  {
    id: 'description',
    label: 'Description',
    isRowHeader: true,
    cell: ({ entity }) => (
      <Cell>
        <span className={styles.document}>
          <FavoriteButton entity={entity} />
          <span className={styles.identity}>
            <DocLink entity={entity} />
            <span className={styles.description}>
              {entity.metadata.description}
            </span>
          </span>
        </span>
      </Cell>
    ),
  },
  {
    id: 'owner',
    label: 'Owner',
    width: 210,
    cell: ({ entity }) => (
      <Cell>
        <Owner entity={entity} />
      </Cell>
    ),
  },
  {
    id: 'kind',
    label: 'Category',
    width: 120,
    cell: ({ entity }) => (
      <Cell>
        <span className={styles.kind}>{entity.kind}</span>
      </Cell>
    ),
  },
  {
    id: 'type',
    label: 'Type',
    width: 95,
    cell: ({ entity }) => (
      <Cell>
        <span className={styles.type}>
          {typeof entity.spec?.type === 'string' ? entity.spec.type : '—'}
        </span>
      </Cell>
    ),
  },
];
