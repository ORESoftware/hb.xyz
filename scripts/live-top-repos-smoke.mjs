import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  fetchTopGitHubRepositories,
  TOP_REPOSITORY_LIMIT,
} = require('../dist/github/top-repos.js');

const repositories = await fetchTopGitHubRepositories(undefined, process.env);

assert.equal(repositories.length, TOP_REPOSITORY_LIMIT);
for (let index = 0; index < repositories.length; index += 1) {
  const repository = repositories[index];
  assert.match(repository.full_name, /^[^/\s]+\/[^/\s]+$/);
  assert.ok(Number.isSafeInteger(repository.stargazers_count));
  assert.ok(repository.stargazers_count >= 0);
  if (index > 0) {
    assert.ok(repositories[index - 1].stargazers_count >= repository.stargazers_count);
  }
}

console.log(JSON.stringify({
  status: 'passed',
  count: repositories.length,
  first: repositories[0].full_name,
  last: repositories[repositories.length - 1].full_name,
}));
