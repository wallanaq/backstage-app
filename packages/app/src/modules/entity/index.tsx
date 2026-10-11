import { coreExtensionData } from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import {
  EntityContentLayoutBlueprint,
  EntityContextMenuItemBlueprint,
  EntityHeaderLayoutBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { AboutCard } from './AboutCard';
import { DevPortalEntityContentLayout } from './EntityContentLayout';
import { DevPortalEntityHeader } from './EntityHeader';
import { LinksCard } from './LinksCard';
import { EntityMenuItem, MenuItemsProvider } from './MenuItems';
import { RelationTableCard, RelationTableCardProps } from './RelationTableCard';

interface RelationCardSpec extends RelationTableCardProps {
  id:
    | 'depends-on-resources'
    | 'depends-on-components'
    | 'has-subcomponents'
    | 'has-components'
    | 'has-resources'
    | 'has-systems'
    | 'has-subdomains';
}

const RELATION_CARDS: RelationCardSpec[] = [
  {
    id: 'depends-on-resources',
    title: 'Depende de recursos',
    relationType: 'dependsOn',
    kind: 'Resource',
    columns: 'resource',
    noun: ['recurso', 'recursos'],
    emptyMessage: 'Nenhum recurso foi encontrado para este componente.',
  },
  {
    id: 'depends-on-components',
    title: 'Depende de componentes',
    relationType: 'dependsOn',
    kind: 'Component',
    columns: 'component',
    noun: ['componente', 'componentes'],
    emptyMessage:
      'Nenhuma dependência de componente foi encontrada para este componente.',
  },
  {
    id: 'has-subcomponents',
    title: 'Possui subcomponentes',
    relationType: 'hasPart',
    kind: 'Component',
    columns: 'component',
    noun: ['subcomponente', 'subcomponentes'],
    emptyMessage: 'Nenhum subcomponente foi encontrado para este componente.',
  },
  {
    id: 'has-components',
    title: 'Possui componentes',
    relationType: 'hasPart',
    kind: 'Component',
    columns: 'component',
    noun: ['componente', 'componentes'],
    emptyMessage: 'Nenhum componente foi encontrado para este sistema.',
  },
  {
    id: 'has-resources',
    title: 'Possui recursos',
    relationType: 'hasPart',
    kind: 'Resource',
    columns: 'resource',
    noun: ['recurso', 'recursos'],
    emptyMessage: 'Nenhum recurso foi encontrado para este sistema.',
  },
  {
    id: 'has-systems',
    title: 'Possui sistemas',
    relationType: 'hasPart',
    kind: 'System',
    columns: 'organization',
    noun: ['sistema', 'sistemas'],
    emptyMessage: 'Nenhum sistema foi encontrado para este domínio.',
  },
  {
    id: 'has-subdomains',
    title: 'Possui subdomínios',
    relationType: 'hasPart',
    kind: 'Domain',
    columns: 'organization',
    noun: ['subdomínio', 'subdomínios'],
    emptyMessage: 'Nenhum subdomínio foi encontrado para este domínio.',
  },
];

function relationTableCards() {
  return RELATION_CARDS.map(({ id, ...props }) =>
    catalogPlugin.getExtension(`entity-card:catalog/${id}`).override({
      factory: originalFactory =>
        originalFactory({
          params: { loader: async () => <RelationTableCard {...props} /> },
        }),
    }),
  );
}

/** The extensions that give the entity page of the catalog the DevPortal look. */
export const entityPageExtensions = [
  EntityHeaderLayoutBlueprint.make({
    name: 'devportal',
    params: { loader: async () => DevPortalEntityHeader },
  }),

  EntityContentLayoutBlueprint.make({
    name: 'devportal',
    params: { loader: async () => DevPortalEntityContentLayout },
  }),

  // The page draws its own top bar (with the crumbs of the entity), and shares
  // the items of its "..." menu with the header, which does not receive them.
  catalogPlugin.getExtension('page:catalog/entity').override({
    factory(originalFactory, { inputs }) {
      const items: EntityMenuItem[] = inputs.contextMenuItems.map(item => ({
        data: item.get(EntityContextMenuItemBlueprint.dataRefs.data),
        node: item.node,
        filter:
          item.get(EntityContextMenuItemBlueprint.dataRefs.filterFunction) ??
          (() => true),
      }));
      const page = originalFactory({ params: { noHeader: true } });

      return Array.from(page).map(value =>
        value.id === coreExtensionData.reactElement.id
          ? coreExtensionData.reactElement(
              <MenuItemsProvider items={items}>
                {page.get(coreExtensionData.reactElement)}
              </MenuItemsProvider>,
            )
          : value,
      );
    },
  }),

  catalogPlugin.getExtension('entity-card:catalog/about').override({
    factory: originalFactory =>
      originalFactory({ params: { loader: async () => <AboutCard /> } }),
  }),

  catalogPlugin.getExtension('entity-card:catalog/links').override({
    factory: originalFactory =>
      originalFactory({ params: { loader: async () => <LinksCard /> } }),
  }),

  ...relationTableCards(),
];
