import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import { DevPortalNotificationsPage } from './NotificationsPage';

/** The notifications plugin with its page swapped for the DevPortal one. */
export const devPortalNotificationsPlugin = notificationsPlugin.withOverrides({
  extensions: [
    notificationsPlugin.getExtension('page:notifications').override({
      factory(originalFactory) {
        return originalFactory({
          params: {
            loader: async () => <DevPortalNotificationsPage />,
          },
        });
      },
    }),
  ],
});
