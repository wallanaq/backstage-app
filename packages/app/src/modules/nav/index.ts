import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { AppLayout } from './AppLayout';
import { DevPortalPageLayoutExtension } from './PageLayout';
import { SidebarContent } from './Sidebar';

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [AppLayout, SidebarContent, DevPortalPageLayoutExtension],
});
