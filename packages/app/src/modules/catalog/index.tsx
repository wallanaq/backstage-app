import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { DevPortalCatalogPage } from './CatalogPage';

/** The catalog plugin with its index page swapped for the DevPortal one. */
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
  ],
});
