/**
 * Copy-paste stub. Wire GET/PUT /api/copy to your own store and auth.
 * The editor calls these with credentials: 'include'.
 */

export function createCopyHandler({ getCopy, saveCopy, isAdmin }) {
  return async function copyHandler(request, response) {
    if (request.method === 'GET') {
      response.json(await getCopy());
      return;
    }

    if (request.method === 'PUT') {
      if (!isAdmin(request)) {
        response.status(401).json({ error: 'Sign in required' });
        return;
      }
      const key = String(request.body?.key ?? '').trim();
      const value = String(request.body?.value ?? '');
      if (!key || key.length > 80 || value.length > 4000) {
        response.status(400).json({ error: 'Invalid request' });
        return;
      }
      response.json(await saveCopy({ key, value }));
      return;
    }

    response.status(405).json({ error: 'Method not allowed' });
  };
}
