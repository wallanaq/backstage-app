import {
  coreExtensionData,
  createExtension,
  createExtensionInput,
} from '@backstage/frontend-plugin-api';
import styles from './AppLayout.module.css';

/**
 * Replaces the default `app/layout`, which wraps everything in the MUI based
 * `SidebarPage` and reserves a hardcoded left padding for its sidebar widths.
 * The DevPortal sidebar has its own width, so the layout is a plain flex row.
 */
export const AppLayout = createExtension({
  name: 'layout',
  attachTo: { id: 'app/root', input: 'children' },
  inputs: {
    nav: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
    content: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
  },
  output: [coreExtensionData.reactElement],
  factory: ({ inputs }) => [
    coreExtensionData.reactElement(
      <div className={styles.root}>
        {inputs.nav.get(coreExtensionData.reactElement)}
        <main className={styles.content}>
          {inputs.content.get(coreExtensionData.reactElement)}
        </main>
      </div>,
    ),
  ],
});
