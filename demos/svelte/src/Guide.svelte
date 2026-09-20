<script lang="ts">
  import { cloneCmd, expressCopyUrl, expressStart, getCopyExample, githubUrl, npmInstall, npmUrl, putCopyExample } from '../../shared/snippets';

  let { title, markupLabel, markup, mountLabel, mount }: {
    title: string;
    markupLabel: string;
    markup: string;
    mountLabel: string;
    mount: string;
  } = $props();
</script>

<section class="panel">
  <h2>Try this page</h2>
  <p>
    Edits stay in <strong>this browser</strong>. These demos do not call an API and cannot change the
    hosted site.
  </p>
  <ol class="steps">
    <li>Open hidden login, then any valid email and password.</li>
    <li>Tap <strong>Edit the site</strong>, click a sentence, type, press Enter.</li>
  </ol>
</section>

<section class="panel" id="add">
  <h2>{title}</h2>
  <p class="row">
    <a href={npmUrl}>npm package</a>
    <a href={githubUrl}>GitHub repo</a>
  </p>
  <ol class="steps">
    <li data-demo="install">
      Install the editor
      <figure class="snippet">
        <figcaption>npm</figcaption>
        <pre><code>{npmInstall}</code></pre>
      </figure>
    </li>
    <li data-demo="mark">
      Mark sentences with <code>data-copy</code>, then mount after paint.
      <figure class="snippet">
        <figcaption>{markupLabel}</figcaption>
        <pre><code>{markup}</code></pre>
      </figure>
    </li>
    <li data-demo="mount">
      Call <code>mount()</code> after paint and pass <code>isAdmin</code> from your session.
      <figure class="snippet">
        <figcaption>{mountLabel}</figcaption>
        <pre><code>{mount}</code></pre>
      </figure>
    </li>
    <li data-demo="persist">
      Persist on a host you run. Clone the example Express API — it writes a JSON file. Point
      <code>endpoints.copy</code> at <code>{expressCopyUrl}</code>. Gate PUT with your login before
      production. Call <code>triggerCi()</code> after a save if you want a rebuild.
      <figure class="snippet">
        <figcaption>clone</figcaption>
        <pre><code>{cloneCmd}</code></pre>
      </figure>
      <figure class="snippet">
        <figcaption>examples/express</figcaption>
        <pre><code>{expressStart}</code></pre>
      </figure>
      <figure class="snippet">
        <figcaption>GET /api/copy</figcaption>
        <pre><code>{getCopyExample}</code></pre>
      </figure>
      <figure class="snippet">
        <figcaption>PUT /api/copy</figcaption>
        <pre><code>{putCopyExample}</code></pre>
      </figure>
    </li>
  </ol>
</section>
