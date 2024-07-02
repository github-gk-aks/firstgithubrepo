const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const environment = core.getInput('environment');
    const secretName = core.getInput('secret-name');
    const octokit = github.getOctokit(token);
    
    const { owner, repo } = github.context.repo;

    // Fetch available environments
    console.log(`Fetching environments for repo: ${owner}/${repo}`);
    const environmentsResponse = await octokit.rest.repos.getAllEnvironments({
      owner,
      repo,
    });
    console.log('Available environments:', environmentsResponse.data);
    
    // Fetch secrets in the specified environment
    console.log(`Fetching secrets for environment: ${environment}`);
    const secretsResponse = await octokit.rest.actions.listEnvironmentSecrets({
      owner,
      repo,
      environment_name: `${environment}`,
    });
    console.log('Available secrets in environment:', secretsResponse.data);

    const secret = secretsResponse.data.secrets.find(secret => secret.name === secretName);

    if (!secret) {
      throw new Error(`Secret ${secretName} not found in environment ${environment}`);
    }

    core.setOutput('secret-value', secret.value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
