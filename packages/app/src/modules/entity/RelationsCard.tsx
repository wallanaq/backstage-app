import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  CompoundEntityRef,
  Entity,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  useEntity,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import { DpCard } from './DpCard';
import { RelationGroup, relationGroups } from './entityInfo';
import { KindIcon } from './kindIcons';
import styles from './RelationsCard.module.css';

/** How many related entities of the same relation are drawn before "+N". */
const TARGETS_PER_RELATION = 3;

interface Row {
  key: string;
  group: RelationGroup;
  /** Only the first row of a relation carries its label. */
  first: boolean;
  target?: CompoundEntityRef;
  /** Entities of the relation that were left out of the drawing. */
  hidden?: number;
}

function toRows(groups: RelationGroup[]): Row[] {
  return groups.flatMap(group => {
    const shown = group.targets.slice(0, TARGETS_PER_RELATION);
    const rows: Row[] = shown.map((target, index) => ({
      key: `${group.type}-${stringifyEntityRef(target)}`,
      group,
      first: index === 0,
      target,
    }));
    const hidden = group.targets.length - shown.length;
    if (hidden > 0) {
      rows.push({ key: `${group.type}-more`, group, first: false, hidden });
    }
    return rows;
  });
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('en-US') + value.slice(1);
}

function graphHref(entity: Entity) {
  const ref = encodeURIComponent(stringifyEntityRef(entity));
  return `/catalog-graph?rootEntityRefs%5B%5D=${ref}`;
}

function CurrentEntity({ entity }: { entity: Entity }) {
  return (
    <div className={`${styles.node} ${styles.current}`}>
      <KindIcon kind={entity.kind} className={styles.nodeIcon} />
      <span className={styles.nodeText}>
        <span className={styles.nodeKind}>{entity.kind}</span>
        <span className={styles.nodeName}>{entity.metadata.name}</span>
      </span>
    </div>
  );
}

function RelatedEntity({ target }: { target: CompoundEntityRef }) {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(target);

  return (
    <Link
      className={`${styles.node} ${styles.related}`}
      to={entityRoute({
        kind: target.kind.toLocaleLowerCase('en-US'),
        namespace: target.namespace.toLocaleLowerCase('en-US'),
        name: target.name,
      })}
    >
      <KindIcon kind={target.kind} className={styles.nodeIcon} />
      <span className={styles.nodeText}>
        <span className={styles.nodeKind}>{capitalize(target.kind)}</span>
        <span className={styles.nodeName}>{primaryTitle}</span>
      </span>
    </Link>
  );
}

function RelationLabel({ group }: { group: RelationGroup }) {
  return (
    <span className={styles.label}>
      {group.type} →
      {group.inverse && (
        <>
          <br />← {group.inverse}
        </>
      )}
    </span>
  );
}

/**
 * The "Relações" card: the current entity on the left and the entities it is
 * directly related to on the right, one line per relation. The full graph
 * (more levels, zoom) is the catalog graph page.
 */
export function RelationsCard() {
  const { entity } = useEntity();
  const rows = toRows(relationGroups(entity));

  return (
    <DpCard
      icon={<CallSplitIcon />}
      title="Relations"
      actions={
        rows.length > 0 ? (
          <Link className={styles.graphLink} to={graphHref(entity)}>
            View full graph
          </Link>
        ) : undefined
      }
      flush
    >
      {rows.length === 0 ? (
        <div className={styles.empty}>
          <CurrentEntity entity={entity} />
          <p className={styles.emptyMessage}>
            No relations were found for this entity.
          </p>
        </div>
      ) : (
        <div
          className={styles.diagram}
          style={{ '--rows': rows.length } as CSSProperties}
        >
          <div className={styles.root}>
            <CurrentEntity entity={entity} />
          </div>
          <div className={styles.trunk} aria-hidden />
          {rows.map((row, index) => (
            <div
              key={row.key}
              className={styles.row}
              style={{ '--i': index + 1 } as CSSProperties}
            >
              <div className={styles.wire} aria-hidden>
                {row.first && <RelationLabel group={row.group} />}
              </div>
              {row.target ? (
                <RelatedEntity target={row.target} />
              ) : (
                <Link
                  className={`${styles.node} ${styles.more}`}
                  to={graphHref(entity)}
                >
                  +{row.hidden} {row.group.type}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </DpCard>
  );
}
