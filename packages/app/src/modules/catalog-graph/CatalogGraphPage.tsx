import { MouseEvent, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  ALL_RELATION_PAIRS,
  EntityNode,
  EntityRelationsGraph,
  EntityRelationsGraphProps,
} from '@backstage/plugin-catalog-graph';
import {
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import { Button } from '@backstage/ui';
import FilterListIcon from '@material-ui/icons/FilterList';
import { SupportMenu } from '../entities/SupportMenu';
import { EmptyState } from '../entity/DpCard';
import { KindIcon } from '../entity/kindIcons';
import { GraphFilters } from './GraphFilters';
import { GraphLabel } from './GraphLabel';
import { GraphNode } from './GraphNode';
import { GraphState } from './graphState';
import { useGraphState } from './useGraphState';
import styles from './CatalogGraphPage.module.css';

function RootChip({ entityRef }: { entityRef: CompoundEntityRef }) {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entityRef);

  return (
    <Link
      className={styles.chip}
      to={entityRoute({
        kind: entityRef.kind.toLocaleLowerCase('en-US'),
        namespace: entityRef.namespace.toLocaleLowerCase('en-US'),
        name: entityRef.name,
      })}
    >
      <KindIcon kind={entityRef.kind} className={styles.chipIcon} />
      {primaryTitle}
    </Link>
  );
}

export interface DevPortalCatalogGraphPageProps {
  /** What the app configuration says about the page (`app.extensions`). */
  config: Partial<GraphState> &
    Pick<
      EntityRelationsGraphProps,
      'relationPairs' | 'zoom' | 'showArrowHeads' | 'kinds' | 'relations'
    >;
}

/**
 * The catalog graph: the entities around one or more starting points and the
 * relations between them. Same URL and same interaction as the page of the
 * plugin, with the look of the DevPortal.
 */
export function DevPortalCatalogGraphPage({
  config,
}: DevPortalCatalogGraphPageProps) {
  const navigate = useNavigate();
  const entityRoute = useRouteRef(entityRouteRef);
  const defaults = useMemo(() => config, [config]);
  const [state, update] = useGraphState(defaults);

  const roots = useMemo(
    () => state.rootEntityRefs.map(ref => parseEntityRef(ref)),
    [state.rootEntityRefs],
  );

  const onNodeClick = useCallback(
    (node: EntityNode, event: MouseEvent<unknown>) => {
      const ref = parseEntityRef(node.id);
      if (event.shiftKey) {
        navigate(
          entityRoute({
            kind: ref.kind.toLocaleLowerCase('en-US'),
            namespace: ref.namespace.toLocaleLowerCase('en-US'),
            name: ref.name,
          }),
        );
      } else {
        update({ rootEntityRefs: [node.id] }, { push: true });
      }
    },
    [entityRoute, navigate, update],
  );

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Catalog graph</h1>
          <p className={styles.description}>
            The entities around a starting point and the relations between them.
          </p>
          {roots.length > 0 && (
            <div className={styles.chips} aria-label="Starting point">
              {roots.map(root => (
                <RootChip
                  key={`${root.kind}:${root.namespace}/${root.name}`}
                  entityRef={root}
                />
              ))}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="medium"
            iconStart={<FilterListIcon />}
            aria-pressed={state.showFilters}
            className={
              state.showFilters
                ? `${styles.filterButton} ${styles.filterButtonOn}`
                : styles.filterButton
            }
            onPress={() => update({ showFilters: !state.showFilters })}
          >
            Filters
          </Button>
          <SupportMenu variant="button" />
        </div>
      </header>

      <div className={styles.body}>
        {state.showFilters && <GraphFilters state={state} onChange={update} />}

        <section className={styles.card} aria-label="Graph">
          {roots.length === 0 ? (
            <div className={styles.empty}>
              <EmptyState icon={<KindIcon kind="component" />}>
                Choose an entity to see the graph. Open an entity from the
                catalog and use &quot;View full graph&quot; in the relations
                card.
              </EmptyState>
              <Link className={styles.emptyLink} to="/catalog">
                Go to the catalog
              </Link>
            </div>
          ) : (
            <>
              <EntityRelationsGraph
                className={styles.graph}
                rootEntityNames={roots}
                maxDepth={state.maxDepth}
                kinds={state.selectedKinds}
                relations={state.selectedRelations}
                unidirectional={state.unidirectional}
                mergeRelations={state.mergeRelations}
                direction={state.direction}
                curve={state.curve}
                relationPairs={config.relationPairs ?? ALL_RELATION_PAIRS}
                showArrowHeads={config.showArrowHeads}
                zoom="enabled"
                renderNode={GraphNode}
                renderLabel={GraphLabel}
                onNodeClick={onNodeClick}
              />
              <p className={styles.hint}>
                Scroll to zoom, drag to move. Click an entity to center the
                graph on it; Shift+click opens the entity.
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
