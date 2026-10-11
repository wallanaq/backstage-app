import {
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  EntityRelationWarning,
  EntitySwitch,
  hasCatalogProcessingErrors,
  hasRelationWarnings,
  isOrphan,
} from '@backstage/plugin-catalog';
import { EntityContentLayoutProps } from '@backstage/plugin-catalog-react/alpha';
import styles from './EntityContentLayout.module.css';

/**
 * The order of the cards of the overview, by the id of their extension. The
 * layout of the design is: about and relations, links and what the entity
 * depends on, then what is below it. Cards that are not listed come after,
 * in the order the app gave them.
 */
const ORDER = [
  'entity-card:catalog/about',
  'entity-card:org/user-profile',
  'entity-card:org/group-profile',
  'entity-card:catalog-graph/relations',
  'entity-card:catalog/links',
  'entity-card:org/ownership',
  'entity-card:org/members-list',
  'entity-card:api-docs/definition',
  'entity-card:catalog/depends-on-resources',
  'entity-card:catalog/depends-on-components',
  'entity-card:catalog/has-subcomponents',
  'entity-card:catalog/has-components',
  'entity-card:catalog/has-resources',
  'entity-card:catalog/has-systems',
  'entity-card:catalog/has-subdomains',
  'entity-card:api-docs/provided-apis',
  'entity-card:api-docs/consumed-apis',
  'entity-card:api-docs/providing-components',
  'entity-card:api-docs/consuming-components',
  'entity-card:api-docs/has-apis',
];

// Cards that need the whole width of the page.
const FULL_WIDTH = ['entity-card:api-docs/definition'];

type Card = EntityContentLayoutProps['cards'][number];

/**
 * The cards are elements wrapped in the boundary of the extension that made
 * them, which is where their id can be read from.
 */
function cardId(card: Card): string | undefined {
  return card.element.props?.node?.spec?.id;
}

function rank(card: Card) {
  const index = ORDER.indexOf(cardId(card) ?? '');
  return index === -1 ? ORDER.length : index;
}

/** The overview of an entity: its cards in two columns, for every kind. */
export function DevPortalEntityContentLayout({
  cards,
}: EntityContentLayoutProps) {
  // `sort` is stable, so unlisted cards keep their order.
  const sorted = [...cards].sort((a, b) => rank(a) - rank(b));

  return (
    <>
      <div className={styles.warnings}>
        <EntitySwitch>
          <EntitySwitch.Case if={isOrphan}>
            <EntityOrphanWarning />
          </EntitySwitch.Case>
        </EntitySwitch>
        <EntitySwitch>
          <EntitySwitch.Case if={hasRelationWarnings}>
            <EntityRelationWarning />
          </EntitySwitch.Case>
        </EntitySwitch>
        <EntitySwitch>
          <EntitySwitch.Case if={hasCatalogProcessingErrors}>
            <EntityProcessingErrorsPanel />
          </EntitySwitch.Case>
        </EntitySwitch>
      </div>

      <div className={styles.grid}>
        {sorted.map((card, index) => {
          const id = cardId(card);
          return (
            <div
              key={card.element.key ?? id ?? index}
              className={styles.cell}
              data-wide={FULL_WIDTH.includes(id ?? '') || undefined}
            >
              {card.element}
            </div>
          );
        })}
      </div>
    </>
  );
}
