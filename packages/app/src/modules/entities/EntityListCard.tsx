import { useEffect, useRef, useState } from 'react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  EntityOrderFilter,
  EntityTextFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import {
  ColumnConfig,
  SearchField,
  SortDescriptor,
  Table,
  TableItem,
} from '@backstage/ui';
import styles from './EntityListCard.module.css';

export interface EntityRow extends TableItem {
  entity: Entity;
}

const PAGE_SIZES = [10, 20, 50].map(value => ({
  value,
  label: `Linhas por página: ${value}`,
}));

function pageLabel(
  plural: string,
  {
    pageSize,
    offset = 0,
    totalCount,
  }: {
    pageSize: number;
    offset?: number;
    totalCount?: number;
  },
) {
  if (totalCount === undefined) {
    return '';
  }
  if (totalCount === 0) {
    return `0 ${plural}`;
  }
  const to = Math.min(offset + pageSize, totalCount);
  return `Mostrando ${offset + 1}–${to} de ${totalCount} ${plural}`;
}

function SearchBox({ placeholder }: { placeholder: string }) {
  const { filters, updateFilters } = useEntityList();
  const [value, setValue] = useState(filters.text?.value ?? '');
  const applied = useRef(filters.text?.value ?? '');

  useEffect(() => {
    if (applied.current === value) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      applied.current = value;
      updateFilters({ text: value ? new EntityTextFilter(value) : undefined });
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, updateFilters]);

  return (
    <div className={styles.search}>
      <SearchField
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export interface EntityListCardProps {
  /** "Todos os serviços", "Todas as APIs"... */
  heading: string;
  /** Plural noun used in the pagination label, lower case unless acronym. */
  plural: string;
  searchPlaceholder: string;
  columns: ColumnConfig<EntityRow>[];
  /** Column id -> catalog field used to sort by that column. */
  sortFields: Record<string, string>;
  density?: 'comfortable' | 'compact';
}

/** The white card with the results bar, the table and the pagination. */
export function EntityListCard({
  heading,
  plural,
  searchPlaceholder,
  columns,
  sortFields,
  density = 'comfortable',
}: EntityListCardProps) {
  const {
    entities,
    loading,
    error,
    totalItems,
    limit,
    offset,
    setLimit,
    setOffset,
    paginationMode,
    pageInfo,
    updateFilters,
  } = useEntityList();
  const [sort, setSort] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending',
  });

  const onSortChange = (descriptor: SortDescriptor) => {
    setSort(descriptor);
    const field = sortFields[String(descriptor.column)];
    if (field) {
      updateFilters({
        order: new EntityOrderFilter([
          [field, descriptor.direction === 'ascending' ? 'asc' : 'desc'],
        ]),
      });
    }
  };

  const rows: EntityRow[] = entities.map(entity => ({
    id: stringifyEntityRef(entity),
    entity,
  }));

  const pageLimit = limit ?? 20;
  const pageOffset = offset ?? 0;
  const hasNextPage =
    paginationMode === 'cursor'
      ? Boolean(pageInfo?.next)
      : pageOffset + pageLimit < (totalItems ?? 0);
  const hasPreviousPage =
    paginationMode === 'cursor' ? Boolean(pageInfo?.prev) : pageOffset > 0;

  return (
    <section className={styles.card} data-density={density}>
      <header className={styles.bar}>
        <h3 className={styles.heading}>
          {heading}
          {totalItems !== undefined && (
            <span className={styles.total}>{totalItems}</span>
          )}
        </h3>
        <SearchBox placeholder={searchPlaceholder} />
      </header>

      <Table<EntityRow>
        columnConfig={columns}
        data={rows}
        isPending={loading}
        error={error}
        sort={{ descriptor: sort, onSortChange }}
        emptyState={
          <div className={styles.empty}>Nenhum resultado encontrado.</div>
        }
        pagination={
          paginationMode === 'none'
            ? { type: 'none' }
            : {
                type: 'page',
                pageSize: pageLimit,
                pageSizeOptions: PAGE_SIZES,
                offset: paginationMode === 'offset' ? pageOffset : undefined,
                totalCount: totalItems,
                hasNextPage,
                hasPreviousPage,
                onNextPage: () =>
                  paginationMode === 'cursor'
                    ? pageInfo?.next?.()
                    : setOffset?.(pageOffset + pageLimit),
                onPreviousPage: () =>
                  paginationMode === 'cursor'
                    ? pageInfo?.prev?.()
                    : setOffset?.(Math.max(0, pageOffset - pageLimit)),
                onPageSizeChange: size => {
                  setLimit?.(size);
                  setOffset?.(0);
                },
                getLabel: params => pageLabel(plural, params),
              }
        }
      />
    </section>
  );
}
