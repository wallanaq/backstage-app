import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import { RelationsCard } from '../entity/RelationsCard';
import { DevPortalCatalogGraphPage } from './CatalogGraphPage';

/**
 * The catalog graph plugin with its page and its entity card swapped for the
 * DevPortal ones. The page is reached from the "Relações" card of an entity
 * (it is not in the menu).
 */
export const devPortalCatalogGraphPlugin = catalogGraphPlugin.withOverrides({
  extensions: [
    catalogGraphPlugin.getExtension('page:catalog-graph').override({
      factory(originalFactory, { config }) {
        return originalFactory({
          params: {
            loader: async () => <DevPortalCatalogGraphPage config={config} />,
          },
        });
      },
    }),
    catalogGraphPlugin
      .getExtension('entity-card:catalog-graph/relations')
      .override({
        factory: originalFactory =>
          originalFactory({
            params: { loader: async () => <RelationsCard /> },
          }),
      }),
  ],
});
