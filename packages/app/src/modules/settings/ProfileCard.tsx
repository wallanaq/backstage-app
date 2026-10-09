import { useEffect, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { ButtonIcon, Menu, MenuItem, MenuTrigger } from '@backstage/ui';
import MoreIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/PersonOutline';
import { useProfile } from '../../hooks/useProfile';
import { SettingsCard } from './SettingsCard';
import styles from './ProfileCard.module.css';

/** The `kind:namespace/name` reference of the signed in user. */
export function useUserEntityRef(): string | undefined {
  const identityApi = useApi(identityApiRef);
  const [ref, setRef] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    identityApi
      .getBackstageIdentity()
      .then(identity => {
        if (!cancelled) setRef(identity.userEntityRef);
      })
      .catch(() => {
        // The card then shows no identifier.
      });
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  return ref;
}

export function ProfileCard() {
  const identityApi = useApi(identityApiRef);
  const profile = useProfile();
  const userRef = useUserEntityRef();

  return (
    <SettingsCard
      icon={<PersonIcon />}
      title="Perfil"
      action={
        <MenuTrigger>
          <ButtonIcon
            variant="tertiary"
            size="small"
            icon={<MoreIcon />}
            aria-label="Mais opções"
          />
          <Menu placement="bottom end">
            <MenuItem onAction={() => identityApi.signOut()}>Sair</MenuItem>
          </Menu>
        </MenuTrigger>
      }
    >
      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden>
          {profile?.name.charAt(0).toUpperCase()}
        </span>
        <div className={styles.identity}>
          <p className={styles.name}>{profile?.name}</p>
          <p className={styles.subtitle}>{profile?.subtitle}</p>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Identificador do usuário</span>
        <code className={styles.code}>{userRef ?? '—'}</code>
      </div>
    </SettingsCard>
  );
}
