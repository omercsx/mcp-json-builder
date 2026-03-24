// All TypeScript interfaces for MCP data

export type McpCategory =
  | 'cloud' // AWS, GCP, Cloudflare
  | 'database' // Postgres, Supabase, MongoDB
  | 'devtools' // GitHub, Filesystem, Git
  | 'ai' // Brave Search, Context7
  | 'productivity' // Slack, Notion, Linear
  | 'payment' // Stripe
  | 'custom'

export interface EnvVarDefinition {
  key: string // API: "name" → renamed to "key"
  label: string // API: "description"
  placeholder: string // Generated from key (e.g., "BRAVE_API_KEY" → "Enter your API key")
  required: boolean // API: "isRequired" (defaults to false)
  sensitive: boolean // API: "isSecret" (true for API keys/tokens)
}

export interface McpServer {
  id: string // API: server.name (reverse-domain ID)
  name: string // API: server.title or derived from name
  description: string // API: server.description
  category: McpCategory
  npmPackage?: string // API: packages[].identifier where registryType === "npm"
  command: string // Derived: "npx" for npm, "uvx" for pypi, "docker" for oci
  defaultArgs: string[] // Derived: ["-y", packageId, ...packageArguments]
  envVars: EnvVarDefinition[]
  optionalConfig?: Record<string, unknown>
  docsUrl?: string // API: server.websiteUrl or server.repository.url
  icon?: string // API: server.icons[0].src (rare)
  source: 'registry' | 'fallback' | 'custom'
}

export interface ConfiguredMcpServer {
  serverId: string // Reference to McpServer.id
  enabled: boolean // Toggle on/off in builder
  envValues: Record<string, string> // User-filled env var values
  args: string[] // User-modified args
  customConfig?: Record<string, unknown> // Any additional config
}

export interface McpJsonOutput {
  mcpServers: Record<
    string,
    {
      command: string
      args: string[]
      env?: Record<string, string>
    }
  >
}

// From API: ListResponse
export interface RegistryListResponse {
  servers: RegistryServerEntry[]
  metadata: {
    nextCursor?: string
    count: number
  }
}

// From API: ServerEntry
export interface RegistryServerEntry {
  server: RegistryServerDefinition
  _meta: {
    'io.modelcontextprotocol.registry/official': {
      status: 'active'
      statusChangedAt: string
      publishedAt: string
      updatedAt: string
      isLatest: boolean
    }
  }
}

// From API: ServerDefinition
export interface RegistryServerDefinition {
  $schema?: string
  name: string
  description: string
  title?: string
  version: string
  repository?: Repository
  websiteUrl?: string
  icons?: Icon[]
  packages?: Package[]
  remotes?: Remote[]
}

// From API: Repository
export interface Repository {
  url: string
  source: 'github'
  id?: string
  subfolder?: string
}

// From API: Icon
export interface Icon {
  src: string
  mimeType: string
}

// From API: Package
export interface Package {
  registryType: 'npm' | 'pypi' | 'oci'
  registryBaseUrl?: string
  identifier: string
  version: string
  runtimeHint?: string
  transport: Transport
  environmentVariables?: EnvironmentVariable[]
  packageArguments?: PackageArgument[]
}

// From API: Transport
export interface Transport {
  type: 'stdio' | 'sse' | 'streamable-http'
  url?: string
}

// From API: EnvironmentVariable
export interface EnvironmentVariable {
  name: string
  description: string
  isRequired?: boolean
  isSecret?: boolean
  format?: string
  value?: string
}

// From API: PackageArgument
export interface PackageArgument {
  name: string
  description: string
  isRequired?: boolean
  format?: string
  type: 'positional' | 'named'
  default?: string
  valueHint?: string
  isRepeated?: boolean
}

// From API: Remote
export interface Remote {
  type: 'streamable-http' | 'sse'
  url: string
  headers?: RemoteHeader[]
}

// From API: RemoteHeader
export interface RemoteHeader {
  name: string
  description: string
  isRequired?: boolean
  isSecret?: boolean
  value?: string
}

export interface CustomMcpServer extends McpServer {
  source: 'custom'
  createdAt: string
  updatedAt: string
}
