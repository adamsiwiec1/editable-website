import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const root = dirname(fileURLToPath(import.meta.url));
const file = join(root, 'data', 'copy.json');
const port = Number(process.env.PORT || 4020);

function read() {
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    return { copy: raw.copy && typeof raw.copy === 'object' ? raw.copy : {} };
  } catch {
    return { copy: {} };
  }
}

function save(key, value) {
  const copy = { ...read().copy };
  const next = String(value ?? '').trim();
  if (next) copy[key] = next;
  else delete copy[key];
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ copy }, null, 2)}\n`);
  return { copy };
}

/**
 * Optional hook after a successful copy save.
 *
 * After a founder edits copy, you can kick CI so a static host rebuilds.
 * Leave this as a pass unless you want a rebuild — then uncomment one of the
 * examples below and fill in your project ids / tokens from env, not source.
 */
function triggerCi() {
  return;

  // GitHub Actions — repository_dispatch (or: gh workflow run deploy.yml)
  // await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`, {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //     Accept: 'application/vnd.github+json',
  //   },
  //   body: JSON.stringify({ event_type: 'copy-updated' }),
  // });

  // GCP Cloud Build — run a trigger (or: gcloud builds triggers run TRIGGER --branch=main)
  // await fetch(
  //   `https://cloudbuild.googleapis.com/v1/projects/${process.env.GCP_PROJECT}/triggers/${process.env.GCP_TRIGGER}:run`,
  //   {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${process.env.GCP_TOKEN}` },
  //     body: JSON.stringify({ source: { branchName: 'main' } }),
  //   },
  // );

  // AWS CodePipeline — start an execution (or: aws codepipeline start-pipeline-execution --name NAME)
  // await fetch(`https://codepipeline.${process.env.AWS_REGION}.amazonaws.com/`, {
  //   method: 'POST',
  //   headers: {
  //     'X-Amz-Target': 'CodePipeline_20150709.StartPipelineExecution',
  //     'Content-Type': 'application/x-amz-json-1.1',
  //   },
  //   body: JSON.stringify({ name: process.env.AWS_PIPELINE }),
  // });
}

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.get('/api/copy', (_req, res) => {
  res.json(read());
});

app.put('/api/copy', (req, res) => {
  const key = String(req.body?.key ?? '').trim();
  if (!key || key.length > 80) {
    res.status(400).json({ error: 'Invalid key' });
    return;
  }
  const content = save(key, req.body?.value);
  triggerCi();
  res.json(content);
});

app.listen(port, () => {
  console.log(`Example copy API  http://localhost:${port}/api/copy`);
  console.log('Saves to examples/express/data/copy.json');
  console.log('Gate PUT with your own login before you deploy this.');
});
