import { SubPageBlueprint } from '@backstage/frontend-plugin-api';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { AppearanceTab, GeneralTab, IdentityTab, ProfileTab } from './Tabs';

const subPage = (name: string, title: string, Component: () => JSX.Element) =>
  SubPageBlueprint.make({
    name,
    params: { path: name, title, loader: async () => <Component /> },
  });

/**
 * The user settings plugin with the DevPortal tabs: Geral, Perfil, Identidade
 * do Backstage and Aparência. The authentication providers and feature flags
 * pages are not in the design, so their tabs are hidden by the page layout;
 * the pages are still reachable by URL.
 */
export const devPortalUserSettingsPlugin = userSettingsPlugin.withOverrides({
  extensions: [
    userSettingsPlugin.getExtension('sub-page:user-settings/general').override({
      factory: originalFactory =>
        originalFactory({
          params: { title: 'Geral', loader: async () => <GeneralTab /> },
        }),
    }),
    subPage('profile', 'Perfil', ProfileTab),
    subPage('identity', 'Identidade do Backstage', IdentityTab),
    subPage('appearance', 'Aparência', AppearanceTab),
  ],
});
