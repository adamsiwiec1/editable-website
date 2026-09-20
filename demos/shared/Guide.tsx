import {
  cloneCmd,
  expressCopyUrl,
  expressStart,
  getCopyExample,
  githubUrl,
  npmInstall,
  npmUrl,
  putCopyExample,
} from './snippets';

function Snippet({ label, code }: { label: string; code: string }) {
  return (
    <figure className="snippet">
      <figcaption>{label}</figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export function Guide({
  title,
  markupLabel,
  markup,
  mountLabel,
  mount,
  tryFirst = 'Leave “I am the owner” on.',
}: {
  title: string;
  markupLabel: string;
  markup: string;
  mountLabel: string;
  mount: string;
  tryFirst?: string;
}) {
  return (
    <>
      <section className="panel">
        <h2>Try this page</h2>
        <p>
          Edits stay in <strong>this browser</strong>. These demos do not call an API and cannot
          change the hosted site.
        </p>
        <ol className="steps">
          <li>{tryFirst}</li>
          <li>Tap <strong>Edit the site</strong>, click a sentence, type, press Enter.</li>
        </ol>
      </section>

      <section className="panel" id="add">
        <h2>{title}</h2>
        <p className="row">
          <a href={npmUrl}>npm package</a>
          <a href={githubUrl}>GitHub repo</a>
        </p>
        <ol className="steps">
          <li data-demo="install">
            Install the editor
            <Snippet label="npm" code={npmInstall} />
          </li>
          <li data-demo="mark">
            Mark sentences with <code>data-copy</code>, then mount after paint.
            <Snippet label="markup" code={markup} />
          </li>
          <li data-demo="mount">
            Call <code>mount()</code> after paint and pass <code>isAdmin</code> from your session.
            <Snippet label={mountLabel} code={mount} />
          </li>
          <li data-demo="persist">
            Persist on a host you run. Clone the example Express API — it writes a JSON file. Point{' '}
            <code>endpoints.copy</code> at <code>{expressCopyUrl}</code>. Gate PUT with your login
            before production. Call <code>triggerCi()</code> after a save if you want a rebuild.
            <Snippet label="clone" code={cloneCmd} />
            <Snippet label="examples/express" code={expressStart} />
            <Snippet label="GET /api/copy" code={getCopyExample} />
            <Snippet label="PUT /api/copy" code={putCopyExample} />
          </li>
        </ol>
      </section>
    </>
  );
}
