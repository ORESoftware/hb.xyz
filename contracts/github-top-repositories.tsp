import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace HbGithub;

@id("GitHubRepository")
model GitHubRepository {
  full_name: string;
  stargazers_count: integer;
}

@id("GitHubRepositorySearchResponse")
model GitHubRepositorySearchResponse {
  items: GitHubRepository[];
}
