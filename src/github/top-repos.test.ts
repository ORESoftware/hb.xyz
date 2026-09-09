import assert = require('node:assert/strict');
import { test } from 'node:test';
import {
  fetchTopGitHubRepositories,
  HttpGet,
  TOP_REPOSITORIES_URL,
  TOP_REPOSITORY_LIMIT,
  TopGitHubRepository,
} from './top-repos';

function makeRepositories(count = TOP_REPOSITORY_LIMIT): TopGitHubRepository[] {
  return Array.from({ length: count }, (_, index) => ({
    full_name: `example/repository-${index + 1}`,
    stargazers_count: 1_000_000 - index,
  }));
}

function response(payload: unknown, inspect?: (url: string, config?: { headers?: Record<string, string> }) => void): HttpGet {
  return async (url, config) => {
    inspect?.(url, config);
    return { data: payload };
  };
}

test('fetches the canonical GitHub query, admits extra upstream fields, and returns exactly 20 repositories', async () => {
  const items = makeRepositories().map((item) => ({ ...item, ignored_upstream_field: true }));
  const repositories = await fetchTopGitHubRepositories(
    response({ items, ignored_response_field: 'not part of the projection' }, (url, config) => {
      assert.equal(url, TOP_REPOSITORIES_URL);
      assert.equal(config?.headers?.Accept, 'application/vnd.github+json');
      assert.equal(config?.headers?.['X-GitHub-Api-Version'], '2022-11-28');
      assert.equal(config?.headers?.Authorization, 'Bearer runtime-secret');
    }),
    { GH_TOKEN: 'runtime-secret' },
  );

  assert.equal(repositories.length, TOP_REPOSITORY_LIMIT);
  assert.equal(repositories[0].full_name, 'example/repository-1');
  assert.equal(repositories[19].full_name, 'example/repository-20');
});

test('fails closed when a projected GitHub field violates the TJSV-backed schema', async () => {
  const items: unknown[] = makeRepositories();
  items[4] = { ...makeRepositories()[4], stargazers_count: 'many' };

  await assert.rejects(
    fetchTopGitHubRepositories(response({ items }), {}),
    /failed TJSV contract admission/,
  );
});

test('rejects an upstream result that is not sorted by descending star count', async () => {
  const items = makeRepositories();
  [items[3], items[4]] = [items[4], items[3]];
  items[4].stargazers_count = items[3].stargazers_count + 10;

  await assert.rejects(
    fetchTopGitHubRepositories(response({ items }), {}),
    /not sorted by descending star count/,
  );
});

test('rejects duplicate repositories in the top-20 window', async () => {
  const items = makeRepositories();
  items[9] = { ...items[9], full_name: items[8].full_name };

  await assert.rejects(
    fetchTopGitHubRepositories(response({ items }), {}),
    /duplicate repository/,
  );
});

test('rejects partial results instead of silently presenting fewer than top 20', async () => {
  const items = makeRepositories(TOP_REPOSITORY_LIMIT - 1);

  await assert.rejects(
    fetchTopGitHubRepositories(response({ items }), {}),
    /expected at least 20/,
  );
});

test('propagates GitHub transport failures', async () => {
  const failingGet: HttpGet = async () => {
    throw new Error('GitHub rate limit');
  };

  await assert.rejects(fetchTopGitHubRepositories(failingGet, {}), /GitHub rate limit/);
});

test('rejects limits outside the contractually supported top-20 window before transport', async () => {
  let called = false;
  const get: HttpGet = async () => {
    called = true;
    return { data: { items: makeRepositories() } };
  };

  await assert.rejects(fetchTopGitHubRepositories(get, {}, 21), /limit must be an integer from 1 through 20/);
  assert.equal(called, false);
});
