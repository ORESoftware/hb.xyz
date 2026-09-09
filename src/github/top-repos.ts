import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export const TOP_REPOSITORY_LIMIT = 20;
export const TOP_REPOSITORIES_URL =
  'https://api.github.com/search/repositories?q=stars%3A%3E1&sort=stars&order=desc&per_page=20';

export interface TopGitHubRepository {
  full_name: string;
  stargazers_count: number;
}

interface TopRepositoriesPayload {
  items: TopGitHubRepository[];
}

type HttpResponse = { data: unknown };
export type HttpGet = (
  url: string,
  config?: { headers?: Record<string, string> },
) => Promise<HttpResponse>;

type SchemaResolverRecord = { base: string };
type SchemaResolverLike = {
  addDocument(document: unknown, sourcePath: string): SchemaResolverRecord;
};
type TjsvModule = {
  SchemaResolver: new () => SchemaResolverLike;
  validateInstance(input: {
    schema: unknown;
    instance: unknown;
    resolver: SchemaResolverLike;
    base: string;
    maxErrors?: number;
  }): { valid: boolean; errors: Array<Record<string, unknown>> };
};

type NativeImport = (specifier: string) => Promise<TjsvModule>;
const nativeImport = new Function('specifier', 'return import(specifier);') as NativeImport;

let authorityCache: unknown;
let tjsvCache: Promise<TjsvModule> | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function authorityPath(): string {
  return path.resolve(__dirname, '../../contracts/github-top-repositories.schema.json');
}

function loadAuthority(): unknown {
  if (authorityCache === undefined) {
    authorityCache = JSON.parse(fs.readFileSync(authorityPath(), 'utf8'));
  }
  return authorityCache;
}

function loadTjsv(): Promise<TjsvModule> {
  if (tjsvCache === undefined) {
    tjsvCache = nativeImport('@oresoftware/typespec-json-schema-validator');
  }
  return tjsvCache;
}

/**
 * Project GitHub's large REST response onto the intentionally small public contract.
 * Extra upstream fields are ignored, while missing/wrong contract fields remain visible
 * to the validator and fail closed.
 */
export function projectTopRepositoriesPayload(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    return payload;
  }

  return {
    items: payload.items.map((item) => {
      if (!isRecord(item)) {
        return item;
      }
      return {
        full_name: item.full_name,
        stargazers_count: item.stargazers_count,
      };
    }),
  };
}

export async function admitTopRepositoriesPayload(payload: unknown): Promise<TopRepositoriesPayload> {
  const projected = projectTopRepositoriesPayload(payload);
  const authority = loadAuthority();
  const tjsv = await loadTjsv();
  const resolver = new tjsv.SchemaResolver();
  const record = resolver.addDocument(authority, authorityPath());
  const verdict = tjsv.validateInstance({
    schema: { $ref: 'GitHubRepositorySearchResponse' },
    instance: projected,
    resolver,
    base: record.base,
    maxErrors: 20,
  });

  if (!verdict.valid) {
    throw new Error(`GitHub top-repositories payload failed TJSV contract admission: ${JSON.stringify(verdict.errors)}`);
  }

  return projected as TopRepositoriesPayload;
}

function assertRanking(repositories: TopGitHubRepository[], limit: number): void {
  if (repositories.length < limit) {
    throw new Error(`GitHub returned ${repositories.length} repositories; expected at least ${limit}.`);
  }

  const names = new Set<string>();
  for (let index = 0; index < limit; index += 1) {
    const repository = repositories[index];
    if (names.has(repository.full_name)) {
      throw new Error(`GitHub top-repositories payload contains duplicate repository ${repository.full_name}.`);
    }
    names.add(repository.full_name);

    if (index > 0 && repositories[index - 1].stargazers_count < repository.stargazers_count) {
      throw new Error('GitHub top-repositories payload is not sorted by descending star count.');
    }
  }
}

function requestHeaders(env: NodeJS.ProcessEnv): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = env.GH_TOKEN || env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const axiosGet: HttpGet = async (url, config) => axios.get(url, config);

export async function fetchTopGitHubRepositories(
  httpGet: HttpGet = axiosGet,
  env: NodeJS.ProcessEnv = process.env,
  limit = TOP_REPOSITORY_LIMIT,
): Promise<TopGitHubRepository[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > TOP_REPOSITORY_LIMIT) {
    throw new Error(`limit must be an integer from 1 through ${TOP_REPOSITORY_LIMIT}.`);
  }

  const response = await httpGet(TOP_REPOSITORIES_URL, { headers: requestHeaders(env) });
  const admitted = await admitTopRepositoriesPayload(response.data);
  assertRanking(admitted.items, limit);
  return admitted.items.slice(0, limit);
}
