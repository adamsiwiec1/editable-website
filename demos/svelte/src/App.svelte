<script lang="ts">
  import { onMount } from 'svelte';
  import { mount, setEditing, unmount } from 'editable-website';
  import { mountOptions } from '../../shared/browser-host';
  import { HIDDEN_LOGIN_PATH, isDemoOwner, setDemoOwner } from '../../shared/hidden-login';
  import { bootWalkthrough } from '../../shared/ew-walk.js';
  import { svelteMount } from '../../shared/snippets';
  import GitHubFooter from './GitHubFooter.svelte';
  import Guide from './Guide.svelte';
  import HiddenLogin from './HiddenLogin.svelte';

  const hidden = window.location.pathname.replace(/\/$/, '') === HIDDEN_LOGIN_PATH;
  let isAdmin = $state(isDemoOwner());

  $effect(() => {
    if (hidden) return;
    void mount(mountOptions({ isAdmin }));
    return () => unmount();
  });

  onMount(() => {
    bootWalkthrough({
      isAdmin: () => isDemoOwner(),
      setEditing,
    });
  });

  const markup = `<h1 data-copy="hero.title">The lot is open.</h1>
<p data-copy="hero.lede" data-copy-multiline>…</p>
<editable-chip></editable-chip>`;
</script>

{#if hidden}
  <HiddenLogin />
{:else}
  <main>
    <p class="kicker">Svelte demo</p>
    <h1 data-copy="hero.title" data-demo="tour-copy">The lot is open.</h1>
    <p class="lede" data-copy="hero.lede" data-copy-multiline>
      Render normal tags with data-copy, then mount() in $effect.
    </p>
    <a class="cta" href="#add" data-copy="hero.cta">Add it to your repo</a>

    <section class="panel" id="how">
      <p>
        Svelte compiles the page; the editor still talks to the DOM. Owners use a hidden URL, not a
        checkbox. Edits on this page stay in your browser.
      </p>
      {#if isAdmin}
        <button
          type="button"
          onclick={() => {
            setDemoOwner(false);
            isAdmin = false;
          }}
        >
          Sign out
        </button>
      {:else}
        <p class="lede">
          Owners bookmark a hidden URL. Use <strong>Try the demo</strong> — that link is not on a real
          marketing page.
        </p>
      {/if}
    </section>

    {#if isAdmin}
      <editable-chip data-demo="edit-chip"></editable-chip>
    {:else}
      <a class="primary try-demo" data-demo="try-demo" href={HIDDEN_LOGIN_PATH}>Try the demo →</a>
    {/if}

    <Guide
      title="Add it to a Svelte repo"
      markupLabel="markup"
      {markup}
      mountLabel="$effect"
      mount={svelteMount}
    />
    <GitHubFooter />
  </main>
{/if}
