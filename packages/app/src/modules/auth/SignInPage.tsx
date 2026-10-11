import { useEffect, useRef, useState } from 'react';
import { UserIdentity } from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/frontend-plugin-api';
import { SignInPageProps } from '@backstage/core-plugin-api';
import { Button } from '@backstage/ui';
import { oidcAuthApiRef } from './oidcAuthApi';
import styles from './SignInPage.module.css';

type State = 'restoring' | 'idle' | 'signing-in';

/**
 * With the redirect flow (`enableExperimentalRedirectFlow`) the auth backend
 * sends the browser back to the app with `?error=<message>` when the sign-in
 * fails.
 */
function readErrorFromUrl(): string | undefined {
  const message = new URL(window.location.href).searchParams.get('error');
  return message === null ? undefined : message || 'unknown error';
}

/** Removes `?error=` from the address, so a reload does not show it again. */
function removeErrorFromUrl() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('error')) {
    url.searchParams.delete('error');
    window.history.replaceState(null, '', url);
  }
}

/**
 * The sign-in page: a single card with the Keycloak button. It first tries
 * to restore the session silently (no popup), like the stock page does.
 */
export function DevPortalSignInPage({ onSignInSuccess }: SignInPageProps) {
  const authApi = useApi(oidcAuthApiRef);
  const errorApi = useApi(errorApiRef);
  const [state, setState] = useState<State>('restoring');
  // Set when a sign-in failed: the message of the error, for the details line.
  const [failure, setFailure] = useState<string | undefined>(readErrorFromUrl);
  // `onSignInSuccess` must be called only once.
  const signedIn = useRef(false);

  const finish = async (interactive: boolean) => {
    const response = await authApi.getBackstageIdentity(
      interactive ? { instantPopup: true } : { optional: true },
    );
    if (!response) {
      if (interactive) {
        throw new Error('Keycloak is not configured to support sign-in');
      }
      return false;
    }
    const profile = await authApi.getProfile();
    if (!signedIn.current) {
      signedIn.current = true;
      onSignInSuccess(
        UserIdentity.create({ identity: response.identity, profile, authApi }),
      );
    }
    return true;
  };

  useEffect(() => {
    removeErrorFromUrl();
    let cancelled = false;
    finish(false)
      .then(restored => {
        if (!restored && !cancelled) setState('idle');
      })
      .catch(() => {
        if (!cancelled) setState('idle');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    setFailure(undefined);
    setState('signing-in');
    try {
      await finish(true);
    } catch (error) {
      errorApi.post(error as Error);
      setFailure((error as Error).message);
      setState('idle');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="sign-in-title">
        <div className={styles.brand} aria-hidden>
          <span className={styles.symbol}>
            <span style={{ height: 18 }} />
            <span style={{ height: 30 }} />
            <span style={{ height: 23 }} />
          </span>
          <span className={styles.name}>backstage</span>
        </div>

        <h1 id="sign-in-title" className={styles.title}>
          Sign in to the portal
        </h1>
        <p className={styles.description}>
          Use your Keycloak account to access the catalog, the templates and the
          documentation.
        </p>

        <Button
          variant="primary"
          size="medium"
          className={styles.button}
          isDisabled={state !== 'idle'}
          onPress={signIn}
        >
          {state === 'idle' ? 'Sign in with Keycloak' : 'Please wait…'}
        </Button>

        <p className={styles.status} role={failure ? 'alert' : 'status'}>
          {failure !== undefined &&
            'Could not sign in. If the account is new, wait for the next catalog sync (up to 1 minute) and try again.'}
          {state === 'restoring' &&
            failure === undefined &&
            'Checking the session…'}
        </p>
        {failure && <p className={styles.detail}>{failure}</p>}
      </section>
    </main>
  );
}
