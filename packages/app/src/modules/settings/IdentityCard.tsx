import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import {
  identityApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PeopleIcon from '@material-ui/icons/PeopleOutline';
import PersonIcon from '@material-ui/icons/PersonOutline';
import { SettingsCard } from './SettingsCard';
import styles from './IdentityCard.module.css';

function useIdentityRefs() {
  const identityApi = useApi(identityApiRef);
  const [refs, setRefs] = useState<{ user: string; ownership: string[] }>();

  useEffect(() => {
    let cancelled = false;
    identityApi
      .getBackstageIdentity()
      .then(identity => {
        if (!cancelled) {
          setRefs({
            user: identity.userEntityRef,
            ownership: identity.ownershipEntityRefs,
          });
        }
      })
      .catch(() => {
        // The card then stays empty.
      });
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  return refs;
}

/** The entity of a reference as a link with the icon of its kind. */
function EntityChip({
  entityRef,
  variant,
}: {
  entityRef: CompoundEntityRef;
  variant: 'link' | 'chip';
}) {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle } = useEntityPresentation(entityRef);
  const isUser = entityRef.kind.toLocaleLowerCase('en-US') === 'user';

  return (
    <Link
      className={variant === 'chip' ? styles.chip : styles.link}
      to={entityRoute({
        kind: entityRef.kind.toLocaleLowerCase('en-US'),
        namespace: entityRef.namespace.toLocaleLowerCase('en-US'),
        name: entityRef.name,
      })}
    >
      {isUser ? <PersonIcon /> : <PeopleIcon />}
      {primaryTitle}
    </Link>
  );
}

const toRef = (ref: string) =>
  parseEntityRef(ref, { defaultKind: 'user', defaultNamespace: 'default' });

export function IdentityCard() {
  const refs = useIdentityRefs();

  return (
    <SettingsCard icon={<FingerprintIcon />} title="Backstage identity">
      <div className={styles.section}>
        <span className={styles.label}>User entity</span>
        {refs && <EntityChip entityRef={toRef(refs.user)} variant="link" />}
      </div>

      <div className={`${styles.section} ${styles.separated}`}>
        <span className={styles.label}>Ownership claims</span>
        <div className={styles.chips}>
          {refs?.ownership.map(ref => (
            <EntityChip key={ref} entityRef={toRef(ref)} variant="chip" />
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}
