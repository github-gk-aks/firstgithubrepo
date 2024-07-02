const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const environment = core.getInput('environment');
    const secretName = core.getInput('secret-name');
    const octokit = github.getOctokit(token);
    
    const { owner, repo } = github.context.repo;

    const { data: secrets } = await octokit.rest.actions.listEnvironmentSecrets({
      owner,
      repo,
      environment_name: environment,
    });

    const secret = secrets.secrets.find(secret => secret.name === secretName);

    if (!secret) {
      throw new Error(`Secret ${secretName} not found in environment ${environment}`);
    }

    core.setOutput('secret-value', secret.value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();