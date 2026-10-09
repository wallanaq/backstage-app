import { useEffect, useState } from 'react';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';

export interface ListCounts {
  all?: number;
  owned?: number;
  starred?: number;
}

export interface ListScope {
  /** Lower case entity kind, e.g. `component` or `api`. */
  kind?: string;
  /** Optional `spec.type` the list is restricted to. */
  type?: string;
  /** Only entities that have this annotation, e.g. `backstage.io/techdocs-ref`. */
  annotation?: string;
}

/** The catalog query filter that selects the entities of a scope. */
export function scopeFilter({ kind, type, annotation }: ListScope) {
  const filter: Record<string, string | symbol> = {};
  if (kind) filter.kind = kind;
  if (type) filter['spec.type'] = type;
  if (annotation) {
    filter[`metadata.annotations.${annotation}`] = CATALOG_FILTER_EXISTS;
  }
  return filter;
}

/** Number of entities in `scope` that are owned/starred by the user. */
export function useListCounts({
  kind,
  type,
  annotation,
}: ListScope): ListCounts {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const { starredEntities } = useStarredEntities();
  const [counts, setCounts] = useState<ListCounts>({});

  // A stable key, so that the counts only reload when the favorites change.
  const starredKey = [...starredEntities].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    const filter = scopeFilter({ kind, type, annotation });

    async function load() {
      const { ownershipEntityRefs } = await identityApi.getBackstageIdentity();
      const starredRefs = starredKey ? starredKey.split(',') : [];

      const [all, owned, starred] = await Promise.all([
        catalogApi.queryEntities({ filter, limit: 0 }),
        ownershipEntityRefs.length
          ? catalogApi.queryEntities({
              filter: { ...filter, 'relations.ownedBy': ownershipEntityRefs },
              limit: 0,
            })
          : undefined,
        starredRefs.length
          ? catalogApi.getEntitiesByRefs({
              entityRefs: starredRefs,
              fields: ['kind', 'spec.type', 'metadata.annotations'],
            })
          : undefined,
      ]);

      if (cancelled) return;
      setCounts({
        all: all.totalItems,
        owned: owned?.totalItems ?? 0,
        starred:
          starred?.items.filter(
            entity =>
              entity &&
              (!kind || entity.kind.toLocaleLowerCase('en-US') === kind) &&
              (!type || entity.spec?.type === type) &&
              (!annotation || entity.metadata.annotations?.[annotation]),
          ).length ?? 0,
      });
    }

    load().catch(() => {
      // The counts are decoration, the filters work without them.
    });
    return () => {
      cancelled = true;
    };
  }, [catalogApi, identityApi, kind, type, annotation, starredKey]);

  return counts;
}
