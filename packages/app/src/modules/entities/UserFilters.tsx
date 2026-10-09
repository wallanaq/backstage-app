import { ReactNode, useEffect, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  EntityUserFilter,
  useEntityList,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import PersonIcon from '@material-ui/icons/PersonOutline';
import StarIcon from '@material-ui/icons/StarBorder';
import { ListScope, useListCounts } from './useListCounts';
import styles from './UserFilters.module.css';

type UserFilterKind = 'owned' | 'starred' | 'all';

const isKind = (value: unknown): value is UserFilterKind =>
  value === 'owned' || value === 'starred' || value === 'all';

/** Keeps the "user" filter of the entity list in sync with the selection. */
function useUserFilter() {
  const identityApi = useApi(identityApiRef);
  const { queryParameters, updateFilters } = useEntityList();
  const { starredEntities } = useStarredEntities();
  const fromUrl = [queryParameters.user].flat()[0];
  const [selected, setSelected] = useState<UserFilterKind>(
    isKind(fromUrl) ? fromUrl : 'all',
  );
  const [ownershipRefs, setOwnershipRefs] = useState<string[]>();

  useEffect(() => {
    identityApi
      .getBackstageIdentity()
      .then(identity => setOwnershipRefs(identity.ownershipEntityRefs))
      .catch(() => setOwnershipRefs([]));
  }, [identityApi]);

  // Only the favorites view depends on the favorites, so changing them while
  // looking at other lists does not reset the pagination.
  const starredKey =
    selected === 'starred' ? [...starredEntities].sort().join(',') : '';

  useEffect(() => {
    if (selected === 'owned') {
      if (ownershipRefs) {
        updateFilters({ user: EntityUserFilter.owned(ownershipRefs) });
      }
    } else if (selected === 'starred') {
      updateFilters({
        user: EntityUserFilter.starred(starredKey ? starredKey.split(',') : []),
      });
    } else {
      updateFilters({ user: EntityUserFilter.all() });
    }
  }, [selected, ownershipRefs, starredKey, updateFilters]);

  return { selected, setSelected };
}

export interface FilterItemProps {
  icon: ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export function FilterItem({
  icon,
  label,
  count,
  active,
  onClick,
}: FilterItemProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}

/** The left column that holds the filters of a list page. */
export function FilterColumn({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.root} aria-label="Filtros">
      {children}
    </aside>
  );
}

/** A titled group of filter items ("Pessoal", "Entidades"...). */
export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

export function FilterDivider() {
  return <hr className={styles.divider} />;
}

export interface UserFiltersProps {
  /** Entities the counts are computed for. */
  scope: ListScope;
  /** "Meus serviços", "Minhas APIs"... */
  ownedLabel: string;
  /** Title of the section with the "Todos" item. */
  entitiesTitle?: string;
  /** Icon of the "Todos" item. */
  allIcon: ReactNode;
  /** Rendered above the personal filters. */
  before?: ReactNode;
  /** Rendered below the entity filters, after a divider. */
  after?: ReactNode;
}

/** The "Pessoal" / "Entidades" filter column of the list pages. */
export function UserFilters({
  scope,
  ownedLabel,
  entitiesTitle = 'Entidades',
  allIcon,
  before,
  after,
}: UserFiltersProps) {
  const { selected, setSelected } = useUserFilter();
  const counts = useListCounts(scope);

  return (
    <FilterColumn>
      {before}

      <FilterSection title="Pessoal">
        <FilterItem
          icon={<PersonIcon />}
          label={ownedLabel}
          count={counts.owned}
          active={selected === 'owned'}
          onClick={() => setSelected('owned')}
        />
        <FilterItem
          icon={<StarIcon />}
          label="Favoritos"
          count={counts.starred}
          active={selected === 'starred'}
          onClick={() => setSelected('starred')}
        />
      </FilterSection>

      <FilterDivider />

      <FilterSection title={entitiesTitle}>
        <FilterItem
          icon={allIcon}
          label="Todos"
          count={counts.all}
          active={selected === 'all'}
          onClick={() => setSelected('all')}
        />
      </FilterSection>

      {after && (
        <>
          <FilterDivider />
          {after}
        </>
      )}
    </FilterColumn>
  );
}
