import { useEffect, useState } from 'react';
import { mount, unmount } from 'editable-website';
import { GitHubFooter } from '../../shared/GitHubFooter';
import { Guide } from '../../shared/Guide';
import { HiddenLoginPage } from '../../shared/HiddenLogin';
import { Walkthrough } from '../../shared/Walkthrough.tsx';
import { mountOptions } from '../../shared/browser-host';
import { HIDDEN_LOGIN_PATH, isDemoOwner, setDemoOwner } from '../../shared/hidden-login';
import { reactMount } from '../../shared/snippets';

const markup = `<h1 data-copy="hero.title">The lot is open.</h1>
<p data-copy="hero.lede" data-copy-multiline>…</p>
<editable-chip />`;

export function App() {
  const hidden = window.location.pathname.replace(/\/$/, '') === HIDDEN_LOGIN_PATH;
  const [isAdmin, setIsAdmin] = useState(isDemoOwner);

  useEffect(() => {
    if (hidden) return undefined;
    void mount(mountOptions({ isAdmin }));
    return () => unmount();
  }, [hidden, isAdmin]);

  if (hidden) {
    return (
      <>
        <HiddenLoginPage />
        <Walkthrough />
      </>
    );
  }

  return (
    <main>
      <p className="kicker">React demo</p>
      <h1 data-copy="hero.title" data-demo="tour-copy">
        The lot is open.
      </h1>
      <p className="lede" data-copy="hero.lede" data-copy-multiline>
        Render normal tags with data-copy, then mount() in useEffect.
      </p>
      <a className="cta" href="#add" data-copy="hero.cta">
        Add it to your repo
      </a>

      <section className="panel" id="how">
        <p>
          React only renders the markup. The package talks to the DOM. Edits on this page stay in your
          browser. Owners use a hidden URL, not a checkbox.
        </p>
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
          <p className="lede">Owners bookmark a hidden URL. Use <strong>Try the demo</strong> — that link is not on a real marketing page.</p>
        )}
      </section>

      {isAdmin ? <editable-chip data-demo="edit-chip" /> : null}
      {!isAdmin ? (
        <a className="primary try-demo" data-demo="try-demo" href={HIDDEN_LOGIN_PATH}>
          Try the demo →
        </a>
      ) : null}
      <Walkthrough />
      <Guide
        title="Add it to a React repo"
        tryFirst="Start the demo, then any valid email and password on the hidden login."
        markupLabel="jsx"
        markup={markup}
        mountLabel="useEffect"
        mount={reactMount}
      />
      <GitHubFooter />
    </main>
  );
}
