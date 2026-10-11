import { createContext, ReactNode, useContext } from 'react';
import { Entity } from '@backstage/catalog-model';
import { AppNode, ExtensionBoundary } from '@backstage/frontend-plugin-api';
import { EntityContextMenuItemData } from '@backstage/plugin-catalog-react/alpha';
import { MenuItem } from '@backstage/ui';

export interface EntityMenuItem {
  data: EntityContextMenuItemData;
  node: AppNode;
  filter: (entity: Entity) => boolean;
}

/**
 * The items of the "..." menu. The entity header layout does not receive them
 * (only the page does), so the page override puts them here.
 */
const MenuItemsContext = createContext<EntityMenuItem[]>([]);

export function MenuItemsProvider({
  items,
  children,
}: {
  items: EntityMenuItem[];
  children: ReactNode;
}) {
  return (
    <MenuItemsContext.Provider value={items}>
      {children}
    </MenuItemsContext.Provider>
  );
}

export function useMenuItems() {
  return useContext(MenuItemsContext);
}

function MenuItemContent({ data }: { data: EntityContextMenuItemData }) {
  const { title, disabled, onClick, ...rest } = data.useProps();
  const onAction = onClick
    ? () => {
        const result = onClick();
        if (result) {
          void result.catch(() => {});
        }
      }
    : undefined;

  return (
    <MenuItem
      iconStart={data.icon}
      href={'href' in rest ? rest.href : undefined}
      onAction={onAction}
      isDisabled={disabled}
    >
      {title}
    </MenuItem>
  );
}

/** One item of the menu, rendered inside the boundary of the extension that made it. */
export function EntityMenuItemView({ item }: { item: EntityMenuItem }) {
  return (
    <ExtensionBoundary node={item.node} errorPresentation="error-api">
      <MenuItemContent data={item.data} />
    </ExtensionBoundary>
  );
}
