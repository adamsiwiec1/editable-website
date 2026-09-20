import { useState, type FormEvent } from 'react';
import { GitHubFooter } from './GitHubFooter';
import { continueWalkthroughAfterLogin, HIDDEN_LOGIN_PATH, isValidDemoEmail, setDemoOwner } from './hidden-login';

export function HiddenLoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidDemoEmail(email) || !pass.trim()) {
      setError('Enter a valid email and a password.');
      return;
    }
    setDemoOwner(true);
    continueWalkthroughAfterLogin();
    window.location.assign('/');
  };

  return (
    <main className="login" data-demo="login-card">
      <p className="kicker">Hidden login</p>
      <p className="lede">{HIDDEN_LOGIN_PATH}</p>
      <h1>Access hidden login</h1>
      <p className="lede">This URL is not linked from the home page. Any valid email and password works. No real session.</p>
      <form data-demo="hidden-login-form" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={pass}
            onChange={(event) => setPass(event.target.value)}
          />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="primary" type="submit">
          Sign in
        </button>
      </form>
      <p>
        <a href="/">← Back</a>
      </p>
      <GitHubFooter />
    </main>
  );
}
