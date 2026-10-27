// /verify/flags (admin) - accounts the abuse rules flagged. Dismiss, Warn (the user
// gets a notification) or Suspend. Suspend blocks the account, so it asks for
// confirmation in a Sheet first.
import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';
import {
  Button,
  EmptyState,
  PageHeader,
  Sheet,
  Spinner,
  Stamp,
  useToast,
} from '../../../shared/ui/index.js';
import { getFlags, reviewFlag } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { formatDateTime } from '../format.js';

export function FlagsPage() {
  const toast = useToast();
  const { data: flags, loading, error, reload } = useLoad(getFlags);
  const [toSuspend, setToSuspend] = useState(null);

  // Save the admin's decision and refresh the list.
  async function review(flag, action) {
    try {
      await reviewFlag(flag._id, action);
      toast(
        `${flag.user ? flag.user.name : 'User'}: ${action === 'dismiss' ? 'dismissed' : action === 'warn' ? 'warned' : 'suspended'}.`
      );
      setToSuspend(null);
      reload();
    } catch (err) {
      toast(errorMessage(err));
    }
  }

  if (loading && !flags) return <Spinner />;
  if (error) return <p className="field-error page">{error}</p>;

  return (
    <section className="page verify-page">
      <PageHeader
        title="Flagged accounts"
        subtitle={`${flags.filter((flag) => flag.status === 'open').length} open`}
      />
      {flags.length === 0 ? <EmptyState title="No flagged accounts." /> : null}
      <ul className="flag-list">
        {flags.map((flag) => (
          <li key={flag._id} className="flag-row">
            <div>
              <strong>{flag.user ? flag.user.name : 'Unknown user'}</strong>
              <p className="muted">
                {flag.details} on {formatDateTime(flag.createdAt)}
              </p>
            </div>
            {flag.status === 'open' ? (
              <div className="button-row">
                <Button variant="quiet" onClick={() => review(flag, 'dismiss')}>
                  Dismiss
                </Button>
                <Button variant="secondary" onClick={() => review(flag, 'warn')}>
                  Warn
                </Button>
                <Button variant="danger" onClick={() => setToSuspend(flag)}>
                  Suspend
                </Button>
              </div>
            ) : (
              <Stamp status={flag.status} />
            )}
          </li>
        ))}
      </ul>
      <Sheet
        open={Boolean(toSuspend)}
        onClose={() => setToSuspend(null)}
        title="Suspend this account?"
      >
        {toSuspend ? (
          <>
            <p>
              {toSuspend.user ? toSuspend.user.name : 'This user'} will not be able to log in until
              an admin restores the account.
            </p>
            <div className="button-row">
              <Button variant="quiet" onClick={() => setToSuspend(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => review(toSuspend, 'suspend')}>
                Suspend account
              </Button>
            </div>
          </>
        ) : null}
      </Sheet>
    </section>
  );
}
