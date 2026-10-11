import { useEffect, useState } from 'react';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { EntityLink } from '../../entities/cells';
import { WidgetCard } from '../WidgetCard';
import styles from './FavoriteEntities.module.css';

function useStarredEntityList(): Entity[] {
  const catalogApi = useApi(catalogApiRef);
  const { starredEntities } = useStarredEntities();
  const [entities, setEntities] = useState<Entity[]>([]);
  const key = [...starredEntities].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    const entityRefs = key ? key.split(',') : [];
    if (!entityRefs.length) {
      setEntities([]);
      return undefined;
    }
    catalogApi
      .getEntitiesByRefs({ entityRefs })
      .then(({ items }) => {
        if (!cancelled) {
          setEntities(items.filter((e): e is Entity => Boolean(e)));
        }
      })
      .catch(() => {
        // The widget simply shows what it has.
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi, key]);

  return entities;
}

export function FavoriteEntities() {
  const entities = useStarredEntityList();

  return (
    <WidgetCard
      icon={<StarBorderIcon />}
      title="Your favorite entities"
      badge={entities.length}
    >
      {entities.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <StarBorderIcon />
          </span>
          <p className={styles.emptyTitle}>You have no favorites yet</p>
          <p className={styles.emptyText}>
            Click the star next to an entity
            <br />
            to add it to this list.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {entities.map(entity => (
            <li
              key={`${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`}
              className={styles.row}
            >
              <span className={styles.rowIcon}>
                <StarIcon />
              </span>
              <span className={styles.rowName}>
                <EntityLink entityRef={entity} />
              </span>
              <span className={styles.rowKind}>{entity.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
