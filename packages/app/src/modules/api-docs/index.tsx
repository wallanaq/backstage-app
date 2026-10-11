import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import { DefinitionCard } from '../entity/DefinitionCard';
import {
  ApisTab,
  ConsumingComponentsCard,
  ProvidingComponentsCard,
} from '../entity/ApiTabs';
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

    // The cards of the entity page, in the DevPortal look.
    apiDocsPlugin.getExtension('entity-card:api-docs/definition').override({
      factory: originalFactory =>
        originalFactory({ params: { loader: async () => <DefinitionCard /> } }),
    }),
    apiDocsPlugin
      .getExtension('entity-card:api-docs/providing-components')
      .override({
        factory: originalFactory =>
          originalFactory({
            params: { loader: async () => <ProvidingComponentsCard /> },
          }),
      }),
    apiDocsPlugin
      .getExtension('entity-card:api-docs/consuming-components')
      .override({
        factory: originalFactory =>
          originalFactory({
            params: { loader: async () => <ConsumingComponentsCard /> },
          }),
      }),

    // The tabs of the entity page. The "APIs" tab of a component and the
    // "Definition" tab of an API reuse those cards.
    apiDocsPlugin.getExtension('entity-content:api-docs/apis').override({
      factory: originalFactory =>
        originalFactory({ params: { loader: async () => <ApisTab /> } }),
    }),
    apiDocsPlugin.getExtension('entity-content:api-docs/definition').override({
      factory: originalFactory =>
        originalFactory({ params: { loader: async () => <DefinitionCard /> } }),
    }),

    // The design has no such cards in the overview: the APIs of a component
    // are in its "API" tab, which still shows them.
    apiDocsPlugin
      .getExtension('entity-card:api-docs/provided-apis')
      .override({ disabled: true }),
    apiDocsPlugin
      .getExtension('entity-card:api-docs/consumed-apis')
      .override({ disabled: true }),
  ],
});
