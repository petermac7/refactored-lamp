'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export type TemplateCard = {
  blocks: string[]
  collection: 'pages' | 'posts'
  description: string
  id: string
  name: string
}

/** Small wireframe thumbnail: one bar per block in the template. */
const Wireframe: React.FC<{ blocks: string[] }> = ({ blocks }) => (
  <div aria-hidden className="sfa-wire">
    <span className="sfa-wire__nav" />
    {blocks.slice(0, 5).map((block, i) => (
      <span className={`sfa-wire__block ${i === 0 ? 'sfa-wire__block--hero' : ''}`} key={i}>
        {block}
      </span>
    ))}
  </div>
)

export const TemplatesClient: React.FC<{ templates: TemplateCard[] }> = ({ templates }) => {
  const router = useRouter()
  const [busy, setBusy] = useState<null | string>(null)
  const [error, setError] = useState<null | string>(null)

  const use = async (template: TemplateCard, target: 'builder' | 'editor' = 'editor') => {
    setBusy(template.id)
    setError(null)
    try {
      const res = await fetch(`/api/templates/${template.id}/create`, {
        credentials: 'include',
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Could not create from template')
      if (target === 'builder') window.location.href = `/builder/pages/${json.id}`
      else router.push(`/admin/collections/${json.collection}/${json.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setBusy(null)
    }
  }

  const section = (collection: 'pages' | 'posts', heading: string, blurb: string) => {
    const items = templates.filter((t) => t.collection === collection)
    return (
      <section className="sfa-section">
        <h2>{heading}</h2>
        <p className="sfa-muted">{blurb}</p>
        <div className="sfa-grid">
          {items.map((template) => (
            <article className="sfa-card" key={template.id}>
              <Wireframe blocks={template.blocks} />
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <footer className="sfa-card__foot">
                <button
                  className="sfa-btn sfa-btn--primary"
                  disabled={busy !== null}
                  onClick={() => use(template)}
                  type="button"
                >
                  {busy === template.id ? 'Creating…' : 'Use template'}
                </button>
                {collection === 'pages' && (
                  <button
                    className="sfa-btn"
                    disabled={busy !== null}
                    onClick={() => use(template, 'builder')}
                    type="button"
                  >
                    Open in Visual Builder
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div>
      {error && (
        <p className="sfa-error" role="alert">
          {error}
        </p>
      )}
      {section(
        'pages',
        'Page templates',
        'Creates a new draft page with the blocks already in place. Edit, preview live, then publish.',
      )}
      {section(
        'posts',
        'Blog post templates',
        'Creates a new draft post with a ready-made outline to write into.',
      )}
    </div>
  )
}
