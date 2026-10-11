import { Route, Routes } from 'react-router-dom';
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { DevPortalTemplatesPage } from './TemplatesPage';

/**
 * The original templates page serves the list at its index and the wizard at
 * `/:namespace/:templateName`. Only the list is replaced, the wizard is the
 * original page, rendered for every other path.
 */
function TemplatesRoutes({ original }: { original: JSX.Element }) {
  return (
    <Routes>
      <Route index element={<DevPortalTemplatesPage />} />
      <Route path="*" element={original} />
    </Routes>
  );
}

const extension = (id: Parameters<typeof scaffolderPlugin.getExtension>[0]) =>
  scaffolderPlugin.getExtension(id);

/**
 * The scaffolder plugin with the DevPortal templates list and tab names. The
 * Actions and Templating Extensions pages are not in the design, so their tabs
 * are hidden by the page layout; the pages are still reachable by URL.
 */
export const devPortalScaffolderPlugin = scaffolderPlugin.withOverrides({
  extensions: [
    extension('sub-page:scaffolder/templates').override({
      factory(originalFactory) {
        const original = originalFactory().get(coreExtensionData.reactElement);
        return originalFactory({
          params: {
            loader: async () => <TemplatesRoutes original={original} />,
          },
        });
      },
    }),
    extension('sub-page:scaffolder/tasks').override({
      factory: originalFactory =>
        originalFactory({ params: { title: 'Tasks' } }),
    }),
    extension('sub-page:scaffolder/editor').override({
      factory: originalFactory =>
        originalFactory({ params: { title: 'Template editor' } }),
    }),
  ],
});
