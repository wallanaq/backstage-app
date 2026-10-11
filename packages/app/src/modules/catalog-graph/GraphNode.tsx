import { useLayoutEffect, useRef, useState } from 'react';
import { KeyboardEvent, MouseEvent } from 'react';
import { DependencyGraphTypes } from '@backstage/core-components';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { EntityNode } from '@backstage/plugin-catalog-graph';
import { KindIcon } from '../entity/kindIcons';
import styles from './GraphNode.module.css';

const HEIGHT = 48;
const ICON = 20;
const PADDING_LEFT = 12;
const TEXT_X = PADDING_LEFT + ICON + 10;
const PADDING_RIGHT = 14;
const MIN_WIDTH = 120;

/**
 * An entity in the graph: a rounded card with the icon of its kind, the kind
 * and the name. The entity the graph starts from is highlighted. Clicking
 * centers the graph on it, Shift+click opens it (the same as the plugin's
 * page); both work with Enter on the keyboard.
 */
export const GraphNode: DependencyGraphTypes.RenderNodeFunction<EntityNode> = ({
  node: { entity, focused, onClick },
}) => {
  const { primaryTitle } = useEntityPresentation(entity);
  const titleRef = useRef<SVGTextElement>(null);
  const kindRef = useRef<SVGTextElement>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  // The layout of the graph needs the real size of the node, so the card is
  // as wide as its texts.
  useLayoutEffect(() => {
    const title = titleRef.current?.getBBox().width ?? 0;
    const kind = kindRef.current?.getBBox().width ?? 0;
    const next = Math.max(
      MIN_WIDTH,
      Math.ceil(TEXT_X + Math.max(title, kind) + PADDING_RIGHT),
    );
    if (next !== width) {
      setWidth(next);
    }
  }, [primaryTitle, entity.kind, width]);

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick({ shiftKey: event.shiftKey } as unknown as MouseEvent);
    }
  };

  return (
    <g
      className={focused ? `${styles.node} ${styles.focused}` : styles.node}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${entity.kind} ${primaryTitle}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-clickable={onClick ? '' : undefined}
    >
      <rect className={styles.box} width={width} height={HEIGHT} rx={8} />
      <KindIcon
        kind={entity.kind}
        className={styles.icon}
        x={PADDING_LEFT}
        y={(HEIGHT - ICON) / 2}
        width={ICON}
        height={ICON}
        style={{ width: ICON, height: ICON, fontSize: ICON }}
      />
      <text ref={kindRef} className={styles.kind} x={TEXT_X} y={19}>
        {entity.kind}
      </text>
      <text ref={titleRef} className={styles.title} x={TEXT_X} y={35}>
        {primaryTitle}
      </text>
      <title>{`${entity.kind}:${entity.metadata.namespace ?? 'default'}/${
        entity.metadata.name
      }`}</title>
    </g>
  );
};
