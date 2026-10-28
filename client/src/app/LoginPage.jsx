// Login in two steps: type your college email, then the 6-digit code sent to it.
// Uses requestCode and verifyCode from useAuth(). In development the dev switcher
// is shown too, so you can act as a seeded user without waiting for an email.
import { useState } from 'react';
import { useAuth } from '../shared/auth/useAuth.js';
import { DevUserSwitcher } from '../shared/auth/DevUserSwitcher.jsx';
import { errorMessage } from '../shared/api/client.js';
import { Button, Field, TextInput } from '../shared/ui/index.js';

export function LoginPage() {
  const { requestCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Run one login step, showing the server's message if it fails.
  async function runStep(event, step) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await step();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // Step 1: ask for a code, then show the code field.
  function handleEmail(event) {
    runStep(event, async () => {
      await requestCode(email);
      setCodeSent(true);
    });
  }

  // Step 2: send the code; on success AuthProvider stores the user and the app opens.
  function handleCode(event) {
    runStep(event, () => verifyCode(email, code));
  }

  return (
    <main className="login">
      <h1>PICT Lost and Found</h1>
      {codeSent ? (
        <form onSubmit={handleCode} noValidate>
          <p>
            We sent a 6-digit code to {email}. It works for 10 minutes. Not in your inbox? Check the
            spam folder.
          </p>
          <Field label="Code" error={error}>
            <TextInput
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
            />
          </Field>
          <Button type="submit" loading={busy}>
            Log in
          </Button>
        </form>
      ) : (
        <form onSubmit={handleEmail} noValidate>
          <Field label="College email" hint="For example yourname@ms.pict.edu" error={error}>
            <TextInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <Button type="submit" loading={busy}>
            Send code
          </Button>
        </form>
      )}
      <DevUserSwitcher />
    </main>
  );
}
