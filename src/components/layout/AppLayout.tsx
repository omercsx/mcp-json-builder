import Header from './Header'

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Catalog */}
        <div className="w-80 border-r border-(--border) overflow-y-auto p-4 bg-(--bg-main)">
          <h2 className="text-lg font-semibold mb-4 text-(--text-primary)">
            Catalog
          </h2>
          <div className="mb-4 px-3 py-2 rounded-md bg-(--bg-elevated) border border-(--border) text-(--text-muted)">
            Search MCP servers...
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-md bg-(--bg-elevated)" />
            ))}
          </div>
        </div>

        {/* Center - builder */}
        <div className="flex-1 overflow-y-auto p-4 bg-(--bg-main)">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-4">📦</span>
            <p className="text-(--text-muted)">
              Add MCP servers from the catalog to get started
            </p>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-96 border-l border-(--border) overflow-y-auto p-4 bg-(--bg-main)">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>

          <pre className="bg-(--bg-code) rounded-md p-4 text-sm font-mono text-(--text-muted) overflow-x-auto">
            {`{
            "mcpServers": {
                  "// your config here": {}
                }
              }`}
          </pre>
        </div>
      </div>
    </div>
  )
}
