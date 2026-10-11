import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { entityPageExtensions } from '../entity';
import { DevPortalCatalogPage } from './CatalogPage';

/**
 * The catalog plugin with its index page and its entity page swapped for the
 * DevPortal ones.
 */
export const devPortalCatalogPlugin = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('page:catalog').override({
      factory(originalFactory, { config }) {
        // The table pages by offset, which gives the "showing X-Y of Z" label.
        const pagination =
          config.pagination === true
            ? { mode: 'offset' as const, limit: 20 }
            : config.pagination;

        return originalFactory({
          params: {
            loader: async () => (
              <DevPortalCatalogPage pagination={pagination} />
            ),
          },
        });
      },
    }),
    ...entityPageExtensions,
  ],
});
