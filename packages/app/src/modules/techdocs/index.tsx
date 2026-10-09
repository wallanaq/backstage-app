import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import { DevPortalDocsPage } from './DocsPage';

/**
 * The techdocs plugin with its index page swapped for the DevPortal one. The
 * reader page (the documentation itself) is not touched.
 *
 * The `initialFilter` setting of the page is not used: the list starts with
 * all the documents.
 */
export const devPortalTechDocsPlugin = techdocsPlugin.withOverrides({
  extensions: [
    techdocsPlugin.getExtension('page:techdocs').override({
      factory(originalFactory) {
        return originalFactory({
          params: {
            loader: async () => <DevPortalDocsPage />,
          },
        });
      },
    }),
  ],
});
