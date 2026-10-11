import {
  AppRootElementBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { LoginRequiredDialog } from './LoginRequiredDialog';
import { oidcAuthApi } from './oidcAuthApi';
import { DevPortalSignInPage } from './SignInPage';

/**
 * Sign-in with Keycloak. The sign-in page and the dialog that asks to sign in
 * again have the same extension ids as the default ones of the app plugin
 * (`sign-in-page:app`, `app-root-element:app/oauth-request-dialog`), so they
 * replace them.
 */
export const authModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    oidcAuthApi,
    AppRootElementBlueprint.make({
      name: 'oauth-request-dialog',
      params: { element: <LoginRequiredDialog /> },
    }),
    SignInPageBlueprint.make({
      params: { loader: async () => DevPortalSignInPage },
    }),
  ],
});
