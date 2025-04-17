import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  ApiRef,
  BackstageIdentityApi,
  configApiRef,
  createApiFactory,
  createApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

export const kcOIDCAuthApiRef: ApiRef<OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi> = createApiRef({
  id: 'auth.keycloak',
});

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: kcOIDCAuthApiRef,
    deps: { 
      configApi: configApiRef,
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
    },
    factory: ({ configApi, discoveryApi, oauthRequestApi }) => OAuth2.create({
      configApi,
      discoveryApi,
      oauthRequestApi,
      provider: {
        id: 'keycloak',
        title: 'Keycloak',
        icon: () => null,
      },
      environment: configApi.getOptionalString('auth.environment'),
      defaultScopes: ['openid', 'email', 'profile'],
      popupOptions: {
        size: {
          fullscreen: true
        },
      },
    })
  }),
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
];
