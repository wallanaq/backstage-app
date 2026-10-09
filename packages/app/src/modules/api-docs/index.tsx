import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import { DevPortalApiExplorerPage } from './ApiExplorerPage';

/** The api-docs plugin with its explorer page swapped for the DevPortal one. */
export const devPortalApiDocsPlugin = apiDocsPlugin.withOverrides({
  extensions: [
    apiDocsPlugin.getExtension('page:api-docs').override({
      factory(originalFactory) {
        return originalFactory({
          params: {
            loader: async () => <DevPortalApiExplorerPage />,
          },
        });
      },
    }),
  ],
});
