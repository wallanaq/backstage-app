import { createApp } from '@backstage/frontend-defaults';
import { devPortalApiDocsPlugin } from './modules/api-docs';
import { devPortalCatalogPlugin } from './modules/catalog';
import { navModule } from './modules/nav';
import { devPortalNotificationsPlugin } from './modules/notifications';
import { devPortalScaffolderPlugin } from './modules/scaffolder';
import { devPortalSearchPlugin } from './modules/search';
import { devPortalUserSettingsPlugin } from './modules/settings';
import { devPortalTechDocsPlugin } from './modules/techdocs';
import { devPortalHomePlugin } from './modules/home';

export default createApp({
  features: [
    devPortalCatalogPlugin,
    devPortalApiDocsPlugin,
    devPortalScaffolderPlugin,
    devPortalSearchPlugin,
    devPortalNotificationsPlugin,
    devPortalTechDocsPlugin,
    devPortalUserSettingsPlugin,
    navModule,
    devPortalHomePlugin,
  ],
});
