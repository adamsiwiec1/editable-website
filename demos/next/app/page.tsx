'use client';

import { useEffect, useState } from 'react';
import { GitHubFooter } from '../../shared/GitHubFooter';
import { Guide } from '../../shared/Guide';
import { Walkthrough } from '../../shared/Walkthrough.tsx';
import { HIDDEN_LOGIN_PATH, isDemoOwner, setDemoOwner } from '../../shared/hidden-login';
import { nextMount } from '../../shared/snippets';
import { Editor } from './editor';

const markup = `<h1 data-copy="hero.title">The lot is open.</h1>
<p data-copy="hero.lede" data-copy-multiline>…</p>`;

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isDemoOwner());
  }, []);

  return (
    <main>
      <p className="kicker">Next.js demo</p>
      <h1 data-copy="hero.title" data-demo="tour-copy">
        The lot is open.
      </h1>
      <p className="lede" data-copy="hero.lede" data-copy-multiline>
        The server renders the marked HTML. A client host calls mount(). You own login — the package
        only gets isAdmin.
      </p>
      <a className="cta" href="#add" data-copy="hero.cta">
        Add it to your repo
      </a>

      <section className="panel" id="how">
        <p>
          Next is different only because you already have a server. Owners use a hidden URL, not a
          checkbox. Edits on this page stay in your browser.
        </p>
        <div className="row">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setDemoOwner(false);
                setIsAdmin(false);
              }}
            >
              Sign out
            </button>
          ) : (
            <p className="lede">
              Owners bookmark a hidden URL. Use <strong>Try the demo</strong> — that link is not on a real
              marketing page.
            </p>
          )}
        </div>
      </section>

      <Editor isAdmin={isAdmin} />
      {!isAdmin ? (
        <a className="primary try-demo" data-demo="try-demo" href={HIDDEN_LOGIN_PATH}>
          Try the demo →
        </a>
      ) : null}
      <Walkthrough />
      <Guide
        title="Add it to a Next.js repo"
        tryFirst="Start the demo, then any valid email and password on the hidden login."
        markupLabel="app/page.tsx"
        markup={markup}
        mountLabel="app/editor.tsx"
        mount={nextMount}
      />
      <GitHubFooter />
    </main>
  );
}
