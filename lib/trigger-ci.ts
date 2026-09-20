/**
 * Optional hook after a successful copy save.
 *
 * After a founder edits copy, you can kick CI so a static host rebuilds.
 * Leave this as a pass unless you want a rebuild — then uncomment one of the
 * examples below and fill in your project ids / tokens from env, not source.
 */
export async function triggerCi(): Promise<void> {
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
