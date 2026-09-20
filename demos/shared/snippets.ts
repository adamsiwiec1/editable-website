export const npmInstall = 'npm i editable-website';
export const npmUrl = 'https://www.npmjs.com/package/editable-website';
export const githubUrl = 'https://github.com/adamsiwiec1/editable-website';
export const cloneCmd = 'git clone https://github.com/adamsiwiec1/editable-website.git';
export const expressStart = `cd editable-website/examples/express
npm i
npm start`;
export const expressCopyUrl = 'http://localhost:4020/api/copy';

export const getCopyExample = `{
  "copy": {
    "hero.title": "The lot is open."
  }
}`;

export const putCopyExample = `{
  "key": "hero.title",
  "value": "Sold on the lot."
}`;

export const htmlMount = `<h1 data-copy="hero.title">The lot is open.</h1>
<editable-chip></editable-chip>
<script src="./editable-website.js"></script>
<script>
  EditableWebsite.mount({
    isAdmin: true,
    endpoints: { copy: 'http://localhost:4020/api/copy' },
  });
</script>`;

export const reactMount = `import { useEffect } from 'react';
import { mount, unmount } from 'editable-website';

useEffect(() => {
  void mount({
    isAdmin,
    endpoints: { copy: 'http://localhost:4020/api/copy' },
  });
  return () => unmount();
}, [isAdmin]);`;

export const nextMount = `'use client';
import { useEffect } from 'react';
import { mount, unmount } from 'editable-website';

useEffect(() => {
  void mount({
    isAdmin, // from your session, not the package
    endpoints: { copy: 'http://localhost:4020/api/copy' },
  });
  return () => unmount();
}, [isAdmin]);`;

export const svelteMount = `import { mount, unmount } from 'editable-website';

$effect(() => {
  void mount({
    isAdmin,
    endpoints: { copy: 'http://localhost:4020/api/copy' },
  });
  return () => unmount();
});`;
