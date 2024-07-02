const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const environment = core.getInput('environment');
    const secretName = core.getInput('secret-name');

    const octokit = new Octokit({
        auth: token,
        userAgent: 'octokit/rest.js v20.0.1',
        baseUrl: 'https://api.github.com',
        log: {
          debug: () => {},
          info: () => {},
          warn: console.warn,
          error: console.error
        },
        request: {
          agent: undefined,
          fetch: undefined,
          timeout: 0
        }
      });

    const { owner, repo } = github.context.repo;

    // URL encode the environment name
    const encodedEnvironment = encodeURIComponent(environment);
    console.log(`Encoded environment name: ${encodedEnvironment}`);
    console.log(`Fetching secrets for environment: ${encodedEnvironment}`);
    console.log(`Owner: ${owner}, Repo: ${repo}`);

    // Fetch environments to ensure the environment exists
    const environmentsResponse = await octokit.rest.repos.getAllEnvironments({
      owner,
      repo,
    });
    console.log('Environments response:', environmentsResponse.data);

    const environmentExists = environmentsResponse.data.environments.some(env => env.name === environment);
    if (!environmentExists) {
      throw new Error(`Environment '${environment}' not found in repository '${owner}/${repo}'`);
    }

    // Fetch secrets for the specified environment
    let secretsResponse;
    try {
      secretsResponse = await octokit.rest.actions.listEnvironmentSecrets({
        owner,
        repo,
        environment_name: encodedEnvironment,
      });
      console.log('Secrets response:', secretsResponse.data);
    } catch (apiError) {
      console.error('API error response:', apiError);
      if (apiError.response) {
        console.error('Error status:', apiError.response.status);
        console.error('Error data:', apiError.response.data);
      }
      throw apiError; // rethrow the error to be caught by the outer catch
    }

    // Find the specific secret
    const secret = secretsResponse.data.secrets.find(secret => secret.name === secretName);
    if (!secret) {
      throw new Error(`Secret '${secretName}' not found in environment '${environment}'`);
    }

    core.setOutput('secret-value', secret.value);
  } catch (error) {
    console.error('Error:', error);
    core.setFailed(error.message);
  }
}

run();
