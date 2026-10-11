import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { oidcAuthApi } from './oidcAuthApi';
import { DevPortalSignInPage } from './SignInPage';

/**
 * Sign-in with Keycloak. The sign-in page has the same extension id as the
 * default one of the app plugin (`sign-in-page:app`), so it replaces it.
 */
export const authModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    oidcAuthApi,
    SignInPageBlueprint.make({
      params: { loader: async () => DevPortalSignInPage },
    }),
  ],
});
