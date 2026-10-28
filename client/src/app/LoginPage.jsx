// Login page: enter your college email, then the code sent to it.
import { useState } from 'react';
import { useAuth } from '../shared/auth/useAuth.js';
import { DemoAccounts } from '../shared/auth/DemoAccounts.jsx';
import { errorMessage } from '../shared/api/client.js';
import { Button, Field, TextInput } from '../shared/ui/index.js';
import { LoginIntro } from './LoginIntro.jsx';
import './login.css';

export function LoginPage() {
  const { requestCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  function handleEmail(event) {
    runStep(event, async () => {
      await requestCode(email);
      setCodeSent(true);
    });
  }

  function handleCode(event) {
    runStep(event, () => verifyCode(email, code));
  }

  return (
    <main className="login">
      <LoginIntro />
      <section className="login-panel">
        <div className="login-card">
          <h1>Log in</h1>
          {codeSent ? (
            <form onSubmit={handleCode} noValidate>
              <p className="login-note">
                We sent a 6-digit code to <strong>{email}</strong>. It works for 10 minutes. Not in
                your inbox? Check the spam folder.
              </p>
              <Field label="Code" error={error}>
                <TextInput
                  className="input code-field tabular"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                />
              </Field>
              <div className="button-row button-row-split">
                <Button variant="quiet" icon="arrow-left" onClick={() => setCodeSent(false)}>
                  Change email
                </Button>
                <Button type="submit" size="lg" loading={busy}>
                  Log in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmail} noValidate>
              <p className="login-note">Use your college email. We will send you a code.</p>
              <Field label="College email" hint="For example yourname@ms.pict.edu" error={error}>
                <TextInput
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>
              <Button type="submit" size="lg" icon="arrow-right" loading={busy}>
                Send code
              </Button>
            </form>
          )}
          <DemoAccounts />
        </div>
      </section>
    </main>
  );
}
