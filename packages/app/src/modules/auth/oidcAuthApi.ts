import {
  ApiBlueprint,
  AuthProviderInfo,
  BackstageIdentityApi,
  configApiRef,
  createApiRef,
  discoveryApiRef,
  OAuthApi,
  oauthRequestApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/frontend-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

/** The Keycloak sign-in: the `oidc` provider of the auth backend. */
export const oidcAuthApiRef = createApiRef<
  OAuthApi &
    OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
>({ id: 'internal.auth.oidc' });

const provider: AuthProviderInfo = {
  id: 'oidc',
  title: 'Keycloak',
  icon: () => null,
};

export const oidcAuthApi = ApiBlueprint.make({
  name: 'oidc-auth',
  params: defineParams =>
    defineParams({
      api: oidcAuthApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        oauthRequestApi: oauthRequestApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
        OAuth2.create({
          configApi,
          discoveryApi,
          oauthRequestApi,
          provider,
          environment: configApi.getOptionalString('auth.environment'),
          defaultScopes: ['openid', 'profile', 'email'],
        }),
    }),
});
