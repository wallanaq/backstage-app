import {
  ANNOTATION_EDIT_URL,
  ANNOTATION_VIEW_URL,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { AppIcon } from '@backstage/core-components';
import { getEntityRelations } from '@backstage/plugin-catalog-react';
import { Cell, ColumnConfig } from '@backstage/ui';
import EditIcon from '@material-ui/icons/EditOutlined';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {
  Actions,
  Description,
  EntityLink,
  FavoriteButton,
  IconLink,
  Lifecycle,
  Muted,
  NameCell,
  Owners,
  Tags,
} from '../entities/cells';
import { EntityRow } from '../entities/EntityListCard';

export const sortFields = {
  name: 'metadata.name',
  lifecycle: 'spec.lifecycle',
};

export const columns: ColumnConfig<EntityRow>[] = [
  {
    id: 'name',
    label: 'Nome',
    isRowHeader: true,
    isSortable: true,
    width: 220,
    cell: ({ entity }) => (
      <Cell>
        <NameCell entity={entity} icon={<AppIcon id="kind:api" />} />
      </Cell>
    ),
  },
  {
    id: 'system',
    label: 'Sistema',
    width: 100,
    cell: ({ entity }) => {
      const [system] = getEntityRelations(entity, RELATION_PART_OF, {
        kind: 'system',
      });
      return (
        <Cell>{system ? <EntityLink entityRef={system} /> : <Muted />}</Cell>
      );
    },
  },
  {
    id: 'owner',
    label: 'Responsável',
    width: 170,
    cell: ({ entity }) => (
      <Cell>
        <Owners entity={entity} />
      </Cell>
    ),
  },
  {
    id: 'type',
    label: 'Tipo',
    width: 100,
    cell: ({ entity }) => (
      <Cell>
        {typeof entity.spec?.type === 'string' ? entity.spec.type : <Muted />}
      </Cell>
    ),
  },
  {
    id: 'lifecycle',
    label: 'Ciclo de vida',
    isSortable: true,
    width: 130,
    cell: ({ entity }) => (
      <Cell>
        <Lifecycle value={entity.spec?.lifecycle} />
      </Cell>
    ),
  },
  {
    id: 'description',
    label: 'Descrição',
    cell: ({ entity }) => (
      <Cell>
        <Description entity={entity} truncate />
      </Cell>
    ),
  },
  {
    id: 'tags',
    label: 'Tags',
    width: 90,
    cell: ({ entity }) => (
      <Cell>
        <Tags entity={entity} />
      </Cell>
    ),
  },
  {
    id: 'actions',
    label: 'Ações',
    width: 100,
    cell: ({ entity }) => (
      <Cell>
        <Actions compact>
          <IconLink
            href={entity.metadata.annotations?.[ANNOTATION_VIEW_URL]}
            label="Abrir API"
          >
            <OpenInNewIcon />
          </IconLink>
          <IconLink
            href={entity.metadata.annotations?.[ANNOTATION_EDIT_URL]}
            label="Editar API"
          >
            <EditIcon />
          </IconLink>
          <FavoriteButton entity={entity} />
        </Actions>
      </Cell>
    ),
  },
];
