import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CompoundEntityRef,
  Entity,
  RELATION_OWNED_BY,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  getEntityRelations,
  useEntityPresentation,
  useStarredEntity,
} from '@backstage/plugin-catalog-react';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import styles from './cells.module.css';

export function EntityLink({
  entityRef,
}: {
  entityRef: CompoundEntityRef | Entity;
}) {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entityRef);
  const ref =
    'metadata' in entityRef
      ? {
          kind: entityRef.kind,
          namespace: entityRef.metadata.namespace ?? 'default',
          name: entityRef.metadata.name,
        }
      : entityRef;

  return (
    <Link
      className={styles.link}
      to={entityRoute({
        kind: ref.kind.toLocaleLowerCase('en-US'),
        namespace: ref.namespace.toLocaleLowerCase('en-US'),
        name: ref.name,
      })}
    >
      {primaryTitle}
    </Link>
  );
}

/** Name of an entity with the icon of its kind in a small square. */
export function NameCell({
  entity,
  icon,
}: {
  entity: Entity;
  icon: ReactNode;
}) {
  return (
    <span className={styles.name}>
      <span className={styles.typeIcon}>{icon}</span>
      <EntityLink entityRef={entity} />
    </span>
  );
}

export function Muted({ children = '—' }: { children?: ReactNode }) {
  return <span className={styles.muted}>{children}</span>;
}

export function Owners({ entity }: { entity: Entity }) {
  const owners = getEntityRelations(entity, RELATION_OWNED_BY);
  if (!owners.length) {
    return <Muted />;
  }
  return (
    <span className={styles.owners}>
      {owners.map(owner => (
        <EntityLink key={stringifyEntityRef(owner)} entityRef={owner} />
      ))}
    </span>
  );
}

const LIFECYCLE_STYLES: Record<string, string> = {
  experimental: styles.experimental,
  production: styles.production,
  deprecated: styles.deprecated,
};

export function Lifecycle({ value }: { value?: unknown }) {
  if (typeof value !== 'string' || !value) {
    return <Muted />;
  }
  const variant = LIFECYCLE_STYLES[value] ?? styles.neutral;
  return <span className={`${styles.pill} ${variant}`}>{value}</span>;
}

export function Tags({ entity }: { entity: Entity }) {
  const tags = entity.metadata.tags;
  if (!tags?.length) {
    return <Muted />;
  }
  return (
    <span className={styles.tags}>
      {tags.map(tag => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
    </span>
  );
}

export function Description({
  entity,
  truncate,
}: {
  entity: Entity;
  /** Keeps the text on one line, with an ellipsis. */
  truncate?: boolean;
}) {
  return entity.metadata.description ? (
    <span
      className={truncate ? styles.descriptionTruncated : styles.description}
    >
      {entity.metadata.description}
    </span>
  ) : (
    <Muted />
  );
}

/** An icon button that is an external link. */
export function IconLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return <span className={styles.iconActionPlaceholder} />;
  }
  return (
    <a
      className={styles.iconAction}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export function FavoriteButton({ entity }: { entity: Entity }) {
  const { isStarredEntity, toggleStarredEntity } = useStarredEntity(entity);

  return (
    <button
      type="button"
      className={styles.iconAction}
      aria-pressed={isStarredEntity}
      aria-label={isStarredEntity ? 'Remover dos favoritos' : 'Favoritar'}
      onClick={toggleStarredEntity}
    >
      {isStarredEntity ? (
        <StarIcon className={styles.starred} />
      ) : (
        <StarBorderIcon />
      )}
    </button>
  );
}

export function Actions({
  children,
  compact,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <span className={styles.actions} data-compact={compact || undefined}>
      {children}
    </span>
  );
}
