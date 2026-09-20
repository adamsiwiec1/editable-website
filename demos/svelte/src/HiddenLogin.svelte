<script lang="ts">
  import { continueWalkthroughAfterLogin, HIDDEN_LOGIN_PATH, isValidDemoEmail, setDemoOwner } from '../../shared/hidden-login';
  import GitHubFooter from './GitHubFooter.svelte';

  let email = $state('');
  let pass = $state('');
  let error = $state<string | null>(null);

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!isValidDemoEmail(email) || !pass.trim()) {
      error = 'Enter a valid email and a password.';
      return;
    }
    setDemoOwner(true);
    continueWalkthroughAfterLogin();
    window.location.assign('/');
  }
</script>

<main class="login" data-demo="login-card">
  <p class="kicker">Hidden login</p>
  <p class="lede">{HIDDEN_LOGIN_PATH}</p>
  <h1>Access hidden login</h1>
  <p class="lede">This URL is not linked from the home page. Any valid email and password works. No real session.</p>
  <form data-demo="hidden-login-form" onsubmit={onSubmit}>
    <label>
      Email
      <input type="email" required autocomplete="username" bind:value={email} />
    </label>
    <label>
      Password
      <input type="password" required autocomplete="current-password" bind:value={pass} />
    </label>
    {#if error}
      <p class="err">{error}</p>
    {/if}
    <button class="primary" type="submit">Sign in</button>
  </form>
  <p><a href="/">← Back</a></p>
  <GitHubFooter />
</main>
