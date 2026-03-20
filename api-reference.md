# MCP Registry API Reference

> Base URL: `https://registry.modelcontextprotocol.io`
> API Version: `v0` (preview)
> Last verified: 2026-03-20

---

## a) Full Response Shape

### List Endpoint

```
GET /v0/servers?limit={n}&cursor={cursor}&search={term}
```

#### TypeScript Types

```typescript
interface ListResponse {
  servers: ServerEntry[]
  metadata: {
    nextCursor?: string // Format: "serverName:version" — absent when no more pages
    count: number // Number of items returned in this page
  }
}

interface ServerEntry {
  server: ServerDefinition
  _meta: {
    'io.modelcontextprotocol.registry/official': {
      status: 'active' // Only observed value
      statusChangedAt: string // ISO 8601 timestamp
      publishedAt: string // ISO 8601 timestamp
      updatedAt: string // ISO 8601 timestamp
      isLatest: boolean // true for the newest version of this server
    }
  }
}

interface ServerDefinition {
  $schema: string // e.g. "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json"
  name: string // Reverse-domain ID, e.g. "io.github.brave/brave-search-mcp-server"
  description: string // Short description (may be truncated with "…" in list)
  title?: string // Optional human-friendly display name
  version: string // Semver string
  repository?: Repository
  websiteUrl?: string
  icons?: Icon[]
  packages?: Package[] // For locally-run (stdio) servers
  remotes?: Remote[] // For cloud-hosted servers
}

interface Repository {
  url: string // e.g. "https://github.com/brave/brave-search-mcp-server"
  source: 'github' // Only observed value
  id?: string // GitHub repo ID (optional, numeric string)
  subfolder?: string // Monorepo subfolder path
}

interface Icon {
  src: string // URL to the icon image
  mimeType: string // e.g. "image/png"
}

interface Package {
  registryType: 'npm' | 'pypi' | 'oci'
  registryBaseUrl?: string // e.g. "https://registry.npmjs.org" (usually omitted)
  identifier: string // Package name, e.g. "@brave/brave-search-mcp-server"
  version: string // Package version
  runtimeHint?: string // e.g. "npx"
  transport: Transport
  environmentVariables?: EnvironmentVariable[]
  packageArguments?: PackageArgument[]
}

interface Transport {
  type: 'stdio' | 'sse' | 'streamable-http'
  url?: string // Only for sse/streamable-http, e.g. "http://127.0.0.1:{port}/mcp"
}

interface EnvironmentVariable {
  name: string // e.g. "BRAVE_API_KEY"
  description: string // Human-readable description
  isRequired?: boolean // Defaults to false if omitted
  isSecret?: boolean // true for API keys, tokens, etc.
  format?: string // e.g. "string", "number", "filepath"
  value?: string // Pre-set/default value (rare)
}

interface PackageArgument {
  name: string // Argument name, e.g. "allowed-directories"
  description: string
  isRequired?: boolean
  format?: string // e.g. "string", "number", "filepath"
  type: 'positional' | 'named'
  default?: string // Default value
  valueHint?: string // e.g. "directory"
  isRepeated?: boolean // Can be specified multiple times
}

interface Remote {
  type: 'streamable-http' | 'sse'
  url: string // The remote server URL
  headers?: RemoteHeader[]
}

interface RemoteHeader {
  name: string // e.g. "Authorization"
  description: string
  isRequired?: boolean
  isSecret?: boolean
  value?: string // Template value, e.g. "Bearer {smithery_api_key}"
}
```

### Detail Endpoint

**No working single-server detail endpoint was found.** The following patterns all returned 404:

- `GET /v0/servers/io.github.domdomegg/filesystem-mcp`
- `GET /v0/servers/io.github.domdomegg%2Ffilesystem-mcp`

To get a specific server, use search: `GET /v0/servers?search=filesystem-mcp`

> **Important quirk:** The list/search endpoint returns **ALL versions** of each matching server, not just the latest. Filter client-side using `_meta["io.modelcontextprotocol.registry/official"].isLatest === true`.

---

## b) Environment Variables Structure

Env vars are defined per **package** (not per server), at `server.packages[].environmentVariables[]`.

For remote-only servers, auth info is in `server.remotes[].headers[]` instead.

### Fields

| Field         | Type    | Required | Description                                           |
| ------------- | ------- | -------- | ----------------------------------------------------- |
| `name`        | string  | yes      | Variable name (e.g. `BRAVE_API_KEY`)                  |
| `description` | string  | yes      | Human-readable description                            |
| `isRequired`  | boolean | no       | Whether the variable must be set (default: false)     |
| `isSecret`    | boolean | no       | Whether the value is sensitive (API keys, tokens)     |
| `format`      | string  | no       | Value type hint: `"string"`, `"number"`, `"filepath"` |
| `value`       | string  | no       | Pre-set/default value (rare)                          |

### Real Examples

**1. Brave Search** (`io.github.brave/brave-search-mcp-server`):

```json
{
  "description": "Your API key for the service",
  "isRequired": true,
  "format": "string",
  "isSecret": true,
  "name": "BRAVE_API_KEY"
}
```

**2. Stripe Analytics** (`io.github.lordbasilaiassistant-sudo/stripe-analytics`):

```json
{
  "description": "Your Stripe secret API key",
  "isRequired": true,
  "format": "string",
  "isSecret": true,
  "name": "STRIPE_SECRET_KEY"
}
```

**3. Filesystem MCP** (`io.github.Digital-Defiance/mcp-filesystem`):

```json
{
  "description": "Absolute path to workspace directory (all operations confined here)",
  "isRequired": true,
  "format": "string",
  "name": "WORKSPACE_ROOT"
}
```

**4. DemoStudio** (`io.github.32bitsret/demostudio`) — with isSecret:

```json
{
  "description": "Your DemoStudio API key — generate one at https://demostudio.xyz/settings",
  "isRequired": true,
  "format": "string",
  "isSecret": true,
  "name": "DEMOSTUDIO_API_KEY"
}
```

**5. 1ly Store** (`io.github.1lystore/mcp-server`) — many env vars including optional ones:

```json
[
  {
    "name": "ONELY_WALLET_SOLANA_KEY",
    "isSecret": true,
    "format": "string",
    "description": "Path to Solana keypair JSON file..."
  },
  {
    "name": "ONELY_NETWORK",
    "format": "string",
    "description": "Preferred blockchain network. 'solana' (default) or 'base'."
  },
  {
    "name": "ONELY_BUDGET_PER_CALL",
    "format": "string",
    "description": "Maximum USD amount per single paid API call. Defaults to 1.00."
  }
]
```

---

## c) Package / Command Info

The API does **NOT** provide a `command` or `args` array directly. Instead it provides package registry information from which you must derive the command.

### What the API provides

| Field                         | Example                            | Description                         |
| ----------------------------- | ---------------------------------- | ----------------------------------- |
| `packages[].registryType`     | `"npm"`, `"pypi"`, `"oci"`         | Which package registry              |
| `packages[].identifier`       | `"@brave/brave-search-mcp-server"` | Package name                        |
| `packages[].version`          | `"2.0.58"`                         | Package version                     |
| `packages[].runtimeHint`      | `"npx"`                            | Optional hint for how to run (rare) |
| `packages[].transport.type`   | `"stdio"`                          | Transport mechanism                 |
| `packages[].packageArguments` | (see above)                        | CLI arguments                       |

### Derivation rules for `.mcp.json` generation

```
registryType: "npm"  → command: "npx",  args: ["-y", identifier]
registryType: "pypi" → command: "uvx",  args: [identifier]  (or "pip run", etc.)
registryType: "oci"  → command: "docker", args: ["run", "-i", identifier]
remotes only         → no command needed (use url directly)
```

The `runtimeHint` field (when present) confirms this — observed values: `"npx"`.

For `packageArguments`, positional args are appended after the package name; named args become `--name value` flags.

### Remote-only servers

Some servers have NO `packages` array and only provide `remotes[]`. These are cloud-hosted and need no local command — just the URL and auth headers. Example: Stripe MCP (`com.stripe/mcp`) only has:

```json
{
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://mcp.stripe.com"
    }
  ]
}
```

---

## d) Categories / Tags

**The API provides NO category, tag, or classification field.**

The `name` field uses a reverse-domain convention (e.g., `io.github.brave/brave-search-mcp-server`) but this is an identifier, not a category.

Categories must be assigned manually or via heuristics (e.g., keyword matching on name/description).

---

## e) Icons / Logos

The API **does** support icons via an optional `icons` array:

```typescript
interface Icon {
  src: string // URL
  mimeType: string // e.g. "image/png"
}
```

**However, very few servers provide icons.** In testing, only `ai.adadvisor/mcp-server` had one:

```json
{
  "icons": [
    {
      "src": "https://app.adadvisor.ai/adadvisor-logo.png",
      "mimeType": "image/png"
    }
  ]
}
```

Most servers have no `icons` field at all. Plan for fallback icons.

---

## f) Pagination Reference

| Parameter | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `limit`   | number | Max items per page. Default appears to be **30**.     |
| `cursor`  | string | Cursor from previous response's `metadata.nextCursor` |

### Cursor format

The cursor is a string in the format `"serverName:version"`, e.g.:

- `"ai.aliengiraffe/spotdb:0.1.0"`
- `"ai.aarna/atars-mcp:0.1.0"`
- `"io.github.brave/brave-search-mcp-server:2.0.58"`

### Pagination flow

```
Page 1: GET /v0/servers?limit=10
  → metadata.nextCursor = "ai.aliengiraffe/spotdb:0.1.0"
  → metadata.count = 10

Page 2: GET /v0/servers?limit=10&cursor=ai.aliengiraffe/spotdb:0.1.0
  → metadata.nextCursor = "..."
  → metadata.count = 10

Last page:
  → metadata.nextCursor is ABSENT (key missing, not null)
  → metadata.count = N (remaining items)
```

### Important notes

- The cursor value must NOT be URL-encoded when passed as the `cursor` query parameter — the API handles it directly.
- Results are sorted alphabetically by server name, then by version.
- **All versions** of each server are returned as separate entries. This inflates page counts significantly.

---

## g) Search Reference

| Parameter | Value  | Description           |
| --------- | ------ | --------------------- |
| `search`  | string | Free-text search term |

### Behavior

- Searches across both **name** and **description** fields
- `?search=filesystem` returns servers with "filesystem" in name OR description
- `?search=brave-search` returns servers with "brave-search" in name
- `?search=github` returns many servers — matches name (e.g. `io.github.*`) AND description mentions
- Case-insensitive
- Can be combined with `limit` and `cursor` for paginated search

### Observed limitations

1. **Returns all versions** — searching for "brave-search" returns 30+ entries for the same server (one per version). You must filter by `isLatest: true` client-side.
2. **No exact match mode** — searching for "stripe" returns any server mentioning "Stripe" in name or description.
3. **No field-specific search** — cannot search by name only or description only.
4. **Default limit of 30** applies to search results too — popular servers with many versions can fill an entire page.

---

## h) Gap Analysis

| Planned Field                                  | API Status       | API Source                                                    | Notes                                                                                                     |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id: string`                                   | ✅ Available     | `server.name`                                                 | Reverse-domain format, e.g. `"io.github.brave/brave-search-mcp-server"`                                   |
| `name: string`                                 | ⚠️ Partial       | `server.title` or derive from `server.name`                   | `title` is optional and often missing. Fall back to extracting from `name`                                |
| `description: string`                          | ✅ Available     | `server.description`                                          | May be truncated with "…" in list responses                                                               |
| `category: McpCategory`                        | ❌ Not available | —                                                             | No categories/tags in API. Must derive via heuristics or manual mapping                                   |
| `npmPackage?: string`                          | ⚠️ Partial       | `server.packages[].identifier` where `registryType === "npm"` | Also covers pypi/oci packages. Some servers are remote-only (no package)                                  |
| `command: string`                              | ❌ Not available | —                                                             | Must derive from `registryType`: npm→"npx", pypi→"uvx", oci→"docker". Remote-only servers have no command |
| `defaultArgs: string[]`                        | ⚠️ Partial       | `server.packages[].identifier` + `packageArguments[]`         | Must construct: `["-y", packageId, ...args]`. `packageArguments` provides defaults but format varies      |
| `envVars: EnvVarDefinition[]`                  | ✅ Available     | `server.packages[].environmentVariables[]`                    | Fields: `name`, `description`, `isRequired`, `isSecret`, `format`. Also check `remotes[].headers[]`       |
| `docsUrl?: string`                             | ⚠️ Partial       | `server.websiteUrl` or `server.repository.url`                | `websiteUrl` is optional. `repository.url` is almost always present                                       |
| `icon?: string`                                | ⚠️ Partial       | `server.icons[0].src`                                         | Very rarely populated. Need fallback icons                                                                |
| `source: "registry" \| "fallback" \| "custom"` | ✅ Derivable     | —                                                             | Set to `"registry"` for all API-sourced servers                                                           |

### Legend

- ✅ Directly available from API
- ⚠️ Partially available (needs transformation or has gaps)
- ❌ Not available (needs manual enrichment)

---

## i) Data Strategy Recommendation

**Recommended: Option C — Hybrid with aggressive caching**

### Rationale

1. **API reliability**: The API is `v0` (preview). No SLA. Has quirks (no detail endpoint, returns all versions). Not suitable as sole runtime dependency.

2. **Response payload**: The API returns all versions per server, making responses large. A search for "brave-search" returns 30+ entries for one server. Client-side filtering is required.

3. **Data freshness**: MCP servers don't change frequently. New servers are added daily, but existing servers' metadata rarely changes. Weekly or daily freshness is sufficient.

4. **Client-side app on Cloudflare Pages**: No server-side runtime. All fetching happens in the browser.

### Recommended architecture

```
┌─────────────────────────────────────────────────┐
│  Build time (CI/CD)                             │
│  ─ Fetch ALL servers from registry API          │
│  ─ Filter to isLatest === true only             │
│  ─ Enrich with manual categories, icons, etc.   │
│  ─ Generate static servers.json bundle          │
│  ─ Deploy with app to Cloudflare Pages          │
└─────────────────────────────────────────────────┘
           ↓ bundled as fallback
┌─────────────────────────────────────────────────┐
│  Runtime (browser)                              │
│  ─ Load bundled servers.json immediately        │
│  ─ Optionally fetch live API in background      │
│  ─ Merge live results (newer = wins)            │
│  ─ Cache in localStorage/IndexedDB              │
│  ─ User can also add custom servers             │
└─────────────────────────────────────────────────┘
```

**Why not pure Option A (live only):** API is preview, no detail endpoint, large payloads with version noise. Client would need to paginate through the entire registry (thousands of entries) to build a complete catalog.

**Why not pure Option B (build-time only):** Users would miss newly published servers until the next build. Acceptable for MVP but not ideal.

**For MVP:** Start with Option B (build-time static JSON) — it's simpler and avoids API reliability concerns. Add live fetching later.

---

## j) Fields Requiring Manual Enrichment

### 1. `category: McpCategory`

**Approach:** Keyword-based heuristic mapping at build time.

```typescript
function deriveCategory(server: ServerDefinition): McpCategory {
  const text = `${server.name} ${server.description}`.toLowerCase()
  if (/database|sql|postgres|mysql|mongo|redis|supabase/.test(text))
    return 'database'
  if (/stripe|payment|billing|checkout/.test(text)) return 'payment'
  if (/github|git|npm|docker|ci|deploy|debug|test/.test(text)) return 'devtools'
  if (/openai|anthropic|llm|embedding|ai|gpt|claude/.test(text)) return 'ai'
  if (/aws|gcp|azure|cloud|s3|lambda/.test(text)) return 'cloud'
  if (/slack|email|calendar|notion|obsidian|todoist/.test(text))
    return 'productivity'
  return 'custom'
}
```

Can be supplemented with a manual overrides JSON for well-known servers.

### 2. `command: string`

**Approach:** Derive from `packages[].registryType`:

| registryType  | command                        |
| ------------- | ------------------------------ |
| `npm`         | `"npx"`                        |
| `pypi`        | `"uvx"`                        |
| `oci`         | `"docker"`                     |
| (remote only) | N/A — use `url` field directly |

If `runtimeHint` is present, use it instead.

### 3. `defaultArgs: string[]`

**Approach:** Construct from package info:

```typescript
function deriveArgs(pkg: Package): string[] {
  const args: string[] = []
  if (pkg.registryType === 'npm') args.push('-y', pkg.identifier)
  else if (pkg.registryType === 'pypi') args.push(pkg.identifier)
  else if (pkg.registryType === 'oci') args.push('run', '-i', pkg.identifier)
  // Append packageArguments defaults
  for (const arg of pkg.packageArguments ?? []) {
    if (arg.default) {
      if (arg.type === 'named') args.push(`--${arg.name}`, arg.default)
      else args.push(arg.default)
    }
  }
  return args
}
```

### 4. `icon?: string`

**Approach:**

- Use `server.icons[0].src` when available (rare)
- For well-known servers, maintain a static icon map (e.g., Brave, Stripe, GitHub logos)
- For unknown servers, generate initials-based avatars or use a generic MCP icon

### 5. `name` (display name)

**Approach:**

- Use `server.title` when available
- Otherwise extract from `server.name`: take the part after the last `/`, convert hyphens to spaces, title-case

```typescript
function deriveName(server: ServerDefinition): string {
  if (server.title) return server.title
  const lastPart = server.name.split('/').pop() ?? server.name
  return lastPart.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
```

### 6. `docsUrl?: string`

**Approach:**

- Use `server.websiteUrl` when available
- Fall back to `server.repository?.url`
- Both are optional but `repository.url` is present on ~95% of servers

---

## Appendix: Raw Example Responses

### Server with packages + env vars (Brave Search, latest)

```json
{
  "server": {
    "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
    "name": "io.github.brave/brave-search-mcp-server",
    "description": "Brave Search MCP Server: web results, images, videos, rich results, AI summaries, and more.",
    "repository": {
      "url": "https://github.com/brave/brave-search-mcp-server",
      "source": "github"
    },
    "version": "2.0.58",
    "packages": [
      {
        "registryType": "npm",
        "registryBaseUrl": "https://registry.npmjs.org",
        "identifier": "@brave/brave-search-mcp-server",
        "version": "2.0.58",
        "transport": { "type": "stdio" },
        "environmentVariables": [
          {
            "description": "Your API key for the service",
            "isRequired": true,
            "format": "string",
            "isSecret": true,
            "name": "BRAVE_API_KEY"
          }
        ]
      }
    ]
  },
  "_meta": {
    "io.modelcontextprotocol.registry/official": {
      "status": "active",
      "statusChangedAt": "2025-10-23T16:30:49.649573Z",
      "publishedAt": "2025-10-23T16:30:49.649573Z",
      "updatedAt": "2025-10-23T16:30:49.649573Z",
      "isLatest": false
    }
  }
}
```

### Server with remote only (Stripe)

```json
{
  "server": {
    "$schema": "https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json",
    "name": "com.stripe/mcp",
    "description": "MCP server integrating with Stripe - tools for customers, products, payments, and more.",
    "repository": {
      "url": "https://github.com/stripe/agent-toolkit",
      "source": "github"
    },
    "version": "0.2.4",
    "remotes": [
      {
        "type": "streamable-http",
        "url": "https://mcp.stripe.com"
      }
    ]
  },
  "_meta": {
    "io.modelcontextprotocol.registry/official": {
      "status": "active",
      "statusChangedAt": "2025-10-28T22:06:18.495159Z",
      "publishedAt": "2025-10-28T22:06:18.495159Z",
      "updatedAt": "2025-10-28T22:06:18.495159Z",
      "isLatest": true
    }
  }
}
```

### Server with icons (AdAdvisor)

```json
{
  "server": {
    "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
    "name": "ai.adadvisor/mcp-server",
    "description": "Query Meta Ads performance data — accounts, campaigns, ad sets, ads, metrics & settings.",
    "title": "AdAdvisor MCP Server",
    "version": "1.0.1",
    "websiteUrl": "https://www.adadvisor.ai/docs/user-guide/getting-started-with-mcp?utm_source=mcp-registry",
    "icons": [
      {
        "src": "https://app.adadvisor.ai/adadvisor-logo.png",
        "mimeType": "image/png"
      }
    ],
    "remotes": [
      {
        "type": "streamable-http",
        "url": "https://api.adadvisor.ai/mcp",
        "headers": [
          {
            "description": "Bearer token (adv_sk_...)",
            "isRequired": true,
            "isSecret": true,
            "name": "Authorization"
          }
        ]
      }
    ]
  }
}
```

### Server with packageArguments (Filesystem MCP)

```json
{
  "server": {
    "name": "io.github.j0hanz/filesystem-mcp",
    "title": "Filesystem MCP",
    "version": "1.14.0",
    "packages": [
      {
        "registryType": "npm",
        "identifier": "@j0hanz/filesystem-mcp",
        "version": "1.14.0",
        "transport": { "type": "stdio" },
        "packageArguments": [
          {
            "description": "Optional root directory path the MCP server is allowed to access.",
            "format": "filepath",
            "type": "positional",
            "valueHint": "directory",
            "isRepeated": true
          }
        ]
      }
    ]
  }
}
```

### Server with multiple transports (bytedance filesystem)

```json
{
  "server": {
    "name": "io.github.bytedance/mcp-server-filesystem",
    "version": "1.0.0",
    "packages": [
      {
        "registryType": "npm",
        "identifier": "@agent-infra/mcp-server-filesystem",
        "version": "latest",
        "transport": { "type": "stdio" },
        "packageArguments": [
          {
            "name": "allowed-directories",
            "isRequired": true,
            "type": "named",
            "format": "string"
          }
        ]
      },
      {
        "registryType": "npm",
        "identifier": "@agent-infra/mcp-server-filesystem",
        "version": "latest",
        "runtimeHint": "npx",
        "transport": { "type": "sse", "url": "http://127.0.0.1:{port}/sse" },
        "packageArguments": [
          {
            "name": "allowed-directories",
            "isRequired": true,
            "type": "named"
          },
          {
            "name": "port",
            "isRequired": true,
            "default": "8089",
            "type": "named"
          }
        ]
      },
      {
        "registryType": "npm",
        "identifier": "@agent-infra/mcp-server-filesystem",
        "version": "latest",
        "runtimeHint": "npx",
        "transport": {
          "type": "streamable-http",
          "url": "http://127.0.0.1:{port}/mcp"
        },
        "packageArguments": [
          {
            "name": "allowed-directories",
            "isRequired": true,
            "type": "named"
          },
          {
            "name": "port",
            "isRequired": true,
            "default": "8089",
            "type": "named"
          }
        ]
      }
    ]
  }
}
```
