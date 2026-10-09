import searchPlugin from '@backstage/plugin-search/alpha';
import { DevPortalSearchPage } from './SearchPage';

/**
 * The search plugin with its page swapped for the DevPortal one. The result
 * types, filters and result list items that other plugins contribute to the
 * original page are not used: the page lists the catalog and documentation.
 */
export const devPortalSearchPlugin = searchPlugin.withOverrides({
  extensions: [
    searchPlugin.getExtension('page:search').override({
      factory(originalFactory) {
        return originalFactory({
          params: {
            loader: async () => <DevPortalSearchPage />,
          },
        });
      },
    }),
  ],
});
