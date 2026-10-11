import { coreExtensionData } from '@backstage/frontend-plugin-api';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import { DevPortalDocsPage } from './DocsPage';
import { MissingDocs } from './MissingDocs';

/**
 * The techdocs plugin with its index page swapped for the DevPortal one, and
 * the state of the Docs tab of an entity without documentation. The reader
 * page (the documentation itself) is not touched.
 *
 * The `initialFilter` setting of the page is not used: the list starts with
 * all the documents.
 */
export const devPortalTechDocsPlugin = techdocsPlugin.withOverrides({
  extensions: [
    techdocsPlugin
      .getExtension('empty-state:techdocs/entity-content')
      .override({
        factory: () => [coreExtensionData.reactElement(<MissingDocs />)],
      }),
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
