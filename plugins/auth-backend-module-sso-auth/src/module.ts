import { createBackendModule } from '@backstage/backend-plugin-api';
import { DEFAULT_NAMESPACE, stringifyEntityRef } from '@backstage/catalog-model';
import { oidcAuthenticator, OidcAuthResult } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory, OAuthAuthenticatorResult, SignInResolver } from '@backstage/plugin-auth-node';

const keycloakSignInResolver: SignInResolver<OAuthAuthenticatorResult<OidcAuthResult>> = async (info, ctx) => {

  const username = info?.result.fullProfile.userinfo.preferred_username as string;

  const userRef: any = stringifyEntityRef({
    kind: 'User',
    name: username,
    namespace: DEFAULT_NAMESPACE
  });

  const groups: string[] = info.result.fullProfile.userinfo.groups as string[];

  const groupRefs = groups.map(group => stringifyEntityRef({
    kind: 'Group',
    name: group,
    namespace: DEFAULT_NAMESPACE
  }));

  return ctx.issueToken({
    claims: {
      sub: userRef,
      ent: [userRef, ...groupRefs],
    },
  });
  
}

export const authModuleSsoAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'sso-auth',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'keycloak',
          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,
            signInResolver: keycloakSignInResolver,
          }),
        });
      },
    });
  },
});
