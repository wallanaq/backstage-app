import { useEffect, useState } from 'react';
import {
  configApiRef,
  oauthRequestApiRef,
  PendingOAuthRequest,
  useApi,
} from '@backstage/frontend-plugin-api';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@backstage/ui';
import styles from './LoginRequiredDialog.module.css';

/** The requests of auth providers that are waiting for the user to sign in again. */
function usePendingRequests() {
  const oauthRequestApi = useApi(oauthRequestApiRef);
  const [requests, setRequests] = useState<PendingOAuthRequest[]>([]);

  useEffect(() => {
    const subscription = oauthRequestApi
      .authRequest$()
      .subscribe(pending => setRequests(pending));
    return () => subscription.unsubscribe();
  }, [oauthRequestApi]);

  return requests;
}

/**
 * Shown when a session ended and an auth provider needs the user to sign in
 * again (the stock one is the MUI "Login Required" dialog). One row per
 * provider; "Not now" rejects the requests, so what needed the session fails
 * instead of waiting.
 */
export function LoginRequiredDialog() {
  const requests = usePendingRequests();
  const configApi = useApi(configApiRef);
  const redirects =
    configApi.getOptionalBoolean('enableExperimentalRedirectFlow') ?? false;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const rejectAll = () => requests.forEach(request => request.reject());

  const signIn = async (request: PendingOAuthRequest) => {
    setBusy(true);
    setError(undefined);
    try {
      await request.trigger();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog isOpen={requests.length > 0} isKeyboardDismissDisabled width={440}>
      <DialogHeader>Your session has expired</DialogHeader>
      <DialogBody>
        <p className={styles.text}>
          Sign in again to pick up where you left off.
          {redirects &&
            ' You will be taken to the login page and brought back here afterwards.'}
        </p>
        <ul className={styles.list}>
          {requests.map(request => (
            <li key={request.provider.title} className={styles.item}>
              <div className={styles.provider}>
                <span className={styles.name}>{request.provider.title}</span>
                {request.provider.message && (
                  <span className={styles.message}>
                    {request.provider.message}
                  </span>
                )}
              </div>
              <Button
                className={styles.primary}
                variant="primary"
                size="medium"
                isDisabled={busy}
                onPress={() => signIn(request)}
              >
                {busy ? 'Please wait…' : 'Sign in again'}
              </Button>
            </li>
          ))}
        </ul>
        {error && (
          <p className={styles.error} role="alert">
            Could not sign in: {error}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          className={styles.secondary}
          variant="secondary"
          size="medium"
          isDisabled={busy}
          onPress={rejectAll}
        >
          Not now
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
