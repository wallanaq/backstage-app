import { DependencyGraphTypes } from '@backstage/core-components';
import { EntityEdge } from '@backstage/plugin-catalog-graph';
import styles from './GraphLabel.module.css';

/** The relations of an edge ("ownedBy / ownerOf"), small and quiet. */
export const GraphLabel: DependencyGraphTypes.RenderLabelFunction<
  EntityEdge
> = ({ edge: { relations } }) => (
  <text className={styles.label} textAnchor="middle">
    {relations.map((relation, index) => (
      <tspan
        key={relation}
        className={index % 2 !== 0 ? styles.second : undefined}
      >
        {index > 0 && ' / '}
        {relation}
      </tspan>
    ))}
  </text>
);
