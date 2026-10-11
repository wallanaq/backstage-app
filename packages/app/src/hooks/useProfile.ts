import { useEffect, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

export interface Profile {
  /** Display name, falls back to the user entity name. */
  name: string;
  /** The email of the user. */
  subtitle: string;
}

/** Profile of the signed in user, `undefined` until it has been loaded. */
export function useProfile(): Profile | undefined {
  const identityApi = useApi(identityApiRef);
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      identityApi.getProfileInfo(),
      identityApi.getBackstageIdentity(),
    ])
      .then(([info, identity]) => {
        if (cancelled) return;
        const shortRef =
          identity.userEntityRef.split('/').pop() ?? identity.userEntityRef;
        setProfile({
          name: info.displayName ?? shortRef,
          subtitle: info.email ?? '',
        });
      })
      .catch(() => {
        // Callers render fine without a profile.
      });
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  return profile;
}
