import { useSupportConfig } from '@backstage/core-components';
import {
  Button,
  ButtonIcon,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
} from '@backstage/ui';
import HelpIcon from '@material-ui/icons/HelpOutline';
import styles from './SupportMenu.module.css';

/**
 * Opens the support links of `app.support` (or the Backstage defaults).
 * Replaces the MUI based `SupportButton`.
 */
export function SupportMenu({ variant }: { variant: 'icon' | 'button' }) {
  const { items } = useSupportConfig();

  return (
    <MenuTrigger>
      {variant === 'button' ? (
        <Button
          variant="secondary"
          size="medium"
          iconStart={<HelpIcon />}
          className={styles.button}
        >
          Suporte
        </Button>
      ) : (
        <ButtonIcon
          variant="tertiary"
          icon={<HelpIcon />}
          aria-label="Suporte"
        />
      )}
      <Menu placement="bottom end">
        {items.map(item => (
          <MenuSection key={item.title} title={item.title}>
            {item.links.map(link => (
              <MenuItem key={link.url} href={link.url} target="_blank">
                {link.title || link.url}
              </MenuItem>
            ))}
          </MenuSection>
        ))}
      </Menu>
    </MenuTrigger>
  );
}
