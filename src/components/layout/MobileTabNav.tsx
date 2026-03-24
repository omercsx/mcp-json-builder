import { useState } from 'react'

import { Library, Wrench, Code } from 'lucide-react'

import Header from './Header'

type Tab = 'catalog' | 'builder' | 'preview'

export default function MobileTabNav() {
  const [activeTab, setActiveTab] = useState<Tab>('catalog')

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'catalog' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Catalog</h2>
            <div className="mb-4 px-3 py-2 rounded-md bg-(--bg-elevated) border border-(--border) text-(--text-muted)">
              Search MCP servers...
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-md bg-(--bg-elevated)" />
              ))}
            </div>
          </>
        )}
        {activeTab === 'builder' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-4">📦</span>
            <p className="text-(--text-muted)">
              Add MCP servers from the catalog to get started
            </p>
          </div>
        )}

        {activeTab === 'preview' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <pre className="bg-(--bg-code) rounded-md p-4 text-sm font-mono text-(--text-muted) overflow-x-auto">
              {`{
  "mcpServers": {
    "// your config here": {}
  }
}`}
            </pre>
          </>
        )}
      </div>

      <nav className="flex border-t border-(--border) bg-(--bg-main)">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 ${activeTab === 'catalog' ? 'text-(--primary)' : 'text-(--text-muted)'}`}
        >
          <Library size={20} />
          <span className="text-xs">Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 ${activeTab === 'builder' ? 'text-(--primary)' : 'text-(--text-muted)'}`}
        >
          <Wrench size={20} />
          <span className="text-xs">Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 ${activeTab === 'preview' ? 'text-(--primary)' : 'text-(--text-muted)'}`}
        >
          <Code size={20} />
          <span className="text-xs">Preview</span>
        </button>
      </nav>
    </div>
  )
}
