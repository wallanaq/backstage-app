import { createBackendModule } from '@backstage/backend-plugin-api';
import { DEFAULT_NAMESPACE, stringifyEntityRef } from '@backstage/catalog-model';
import { oidcAuthenticator, OidcAuthResult } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory, OAuthAuthenticatorResult, SignInResolver } from '@backstage/plugin-auth-node';

const keycloakSignInResolver: SignInResolver<OAuthAuthenticatorResult<OidcAuthResult>> = async (info, ctx) => {

  const userinfo = info?.result.fullProfile.userinfo
  const username = userinfo.preferred_username as string;
  const groups: string[] = userinfo.groups as string[];
  const resourceAccess = userinfo.resource_access as UserinfoResourceAccess;
  const roles = resourceAccess?.backstage?.roles ?? []

  const userRef: any = stringifyEntityRef({
    kind: 'User',
    name: username,
    namespace: DEFAULT_NAMESPACE
  });

  const groupRefs = groups.map(group => stringifyEntityRef({
    kind: 'Group',
    name: group,
    namespace: DEFAULT_NAMESPACE
  }));

  return ctx.issueToken({
    claims: {
      sub: userRef,
      ent: [userRef, ...groupRefs],
      roles
    },
  });
  
}

export const authModuleSso = createBackendModule({
  pluginId: 'auth',
  moduleId: 'sso',
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
