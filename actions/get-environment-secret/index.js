const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const environment = core.getInput('environment');
    const secretName = core.getInput('secret-name');
    const octokit = github.getOctokit(token);

    const { owner, repo } = github.context.repo;

    // URL encode the environment name
    const encodedEnvironment = encodeURIComponent(environment);
    console.log(`Encoded environment name: ${encodedEnvironment}`);

    // Fetch environment information
    console.log(`Fetching environments for repo: ${owner}/${repo}`);
    const environmentsResponse = await octokit.rest.repos.getAllEnvironments({
      owner,
      repo,
    });
    console.log('Available environments:', JSON.stringify(environmentsResponse.data, null, 2));

    // Fetch secrets for the specified environment
    console.log(`Fetching secrets for environment: ${encodedEnvironment}`);
    console.log(`Fetching owner name: ${owner}`);
    console.log(`Fetching repo name: ${repo}`);
    const secretsResponse = await octokit.rest.actions.listEnvironmentSecrets({
      owner,
      repo,
      environment_name: encodedEnvironment,
    });
    console.log('Available secrets in environment:', JSON.stringify(secretsResponse.data, null, 2));

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
