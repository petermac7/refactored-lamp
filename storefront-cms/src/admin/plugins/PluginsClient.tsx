'use client'
import React, { useMemo, useState } from 'react'

export type PluginCard = {
  category: string
  description: string
  docs: string
  installed: boolean
  name: string
  package: string
  prompt: string
}

const CopyButton: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for browsers that block the async clipboard API
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button className="sfa-btn sfa-btn--primary" onClick={copy} type="button">
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

export const PluginsClient: React.FC<{ plugins: PluginCard[] }> = ({ plugins }) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'installed'>('all')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return plugins.filter((plugin) => {
      if (filter === 'installed' && !plugin.installed) return false
      if (filter === 'available' && plugin.installed) return false
      if (!q) return true
      return `${plugin.name} ${plugin.package} ${plugin.description} ${plugin.category}`
        .toLowerCase()
        .includes(q)
    })
  }, [plugins, query, filter])

  const installedCount = plugins.filter((plugin) => plugin.installed).length

  return (
    <div>
      <div className="sfa-toolbar">
        <input
          aria-label="Search plugins"
          className="sfa-input"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plugins…"
          type="search"
          value={query}
        />
        <div className="sfa-tabs" role="tablist">
          {(
            [
              ['all', `All (${plugins.length})`],
              ['installed', `Installed (${installedCount})`],
              ['available', `Available (${plugins.length - installedCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              aria-selected={filter === value}
              className="sfa-tab"
              key={value}
              onClick={() => setFilter(value)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && <p className="sfa-empty">No plugins match that search.</p>}

      <div className="sfa-grid sfa-grid--wide">
        {visible.map((plugin) => (
          <article className="sfa-card" key={plugin.package}>
            <header className="sfa-card__head">
              <div>
                <h3>{plugin.name}</h3>
                <code>{plugin.package}</code>
              </div>
              <span className={`sfa-pill ${plugin.installed ? 'sfa-pill--ok' : ''}`}>
                {plugin.installed ? 'Installed' : plugin.category}
              </span>
            </header>
            <p>{plugin.description}</p>
            <label className="sfa-label" htmlFor={`prompt-${plugin.package}`}>
              {plugin.installed ? 'Review prompt' : 'Install prompt'}
            </label>
            <textarea
              className="sfa-prompt"
              id={`prompt-${plugin.package}`}
              readOnly
              rows={7}
              value={plugin.prompt}
            />
            <footer className="sfa-card__foot">
              <CopyButton label="Copy prompt" text={plugin.prompt} />
              <a className="sfa-btn" href={plugin.docs} rel="noopener noreferrer" target="_blank">
                Docs ↗
              </a>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
