import { AppearanceCard } from './AppearanceCard';
import { IdentityCard } from './IdentityCard';
import { ProfileCard } from './ProfileCard';
import styles from './Tabs.module.css';

/** "Geral": the profile and identity next to the appearance. */
export function GeneralTab() {
  return (
    <div className={styles.general}>
      <div className={styles.column}>
        <ProfileCard />
        <IdentityCard />
      </div>
      <div className={styles.wide}>
        <AppearanceCard />
      </div>
    </div>
  );
}

export function ProfileTab() {
  return (
    <div className={styles.single}>
      <ProfileCard />
    </div>
  );
}

export function IdentityTab() {
  return (
    <div className={styles.single}>
      <IdentityCard />
    </div>
  );
}

export function AppearanceTab() {
  return (
    <div className={styles.alone}>
      <AppearanceCard />
    </div>
  );
}
