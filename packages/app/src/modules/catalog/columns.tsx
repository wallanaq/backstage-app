import { ANNOTATION_VIEW_URL } from '@backstage/catalog-model';
import { GitHubIcon } from '@backstage/core-components';
import { Cell, ColumnConfig } from '@backstage/ui';
import CategoryIcon from '@material-ui/icons/Category';
import CodeIcon from '@material-ui/icons/Code';
import {
  Actions,
  Description,
  FavoriteButton,
  IconLink,
  Lifecycle,
  NameCell,
  Owners,
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
    width: 230,
    cell: ({ entity }) => (
      <Cell>
        <NameCell entity={entity} icon={<CategoryIcon />} />
      </Cell>
    ),
  },
  {
    id: 'owner',
    label: 'Responsável',
    width: 190,
    cell: ({ entity }) => (
      <Cell>
        <Owners entity={entity} />
      </Cell>
    ),
  },
  {
    id: 'lifecycle',
    label: 'Ciclo de vida',
    isSortable: true,
    width: 140,
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
        <Description entity={entity} />
      </Cell>
    ),
  },
  {
    id: 'actions',
    label: 'Ações',
    width: 100,
    cell: ({ entity }) => {
      const sourceUrl = entity.metadata.annotations?.[ANNOTATION_VIEW_URL];
      return (
        <Cell>
          <Actions>
            <IconLink href={sourceUrl} label="Abrir repositório">
              {sourceUrl?.includes('github.com') ? (
                <GitHubIcon />
              ) : (
                <CodeIcon />
              )}
            </IconLink>
            <FavoriteButton entity={entity} />
          </Actions>
        </Cell>
      );
    },
  },
];
