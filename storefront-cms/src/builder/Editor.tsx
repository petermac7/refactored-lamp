'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Data } from '@puckeditor/core'

import { createUsePuck, Puck, useGetPuck } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { Layers, Paintbrush, Pencil, Settings2, X } from 'lucide-react'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { fontVariables } from '@/fonts'

import type { FieldTab, PuckData } from './shared'

import { pageConfig, sectionConfig } from './config'
import { reId, stripResolved, tabOf } from './shared'
import './editor.css'

export type BuilderTemplate = { data: PuckData; description: string; id: string; name: string }

type EditorProps = {
  collection: 'pages' | 'sections'
  header?: any
  id: number | string
  initialData: PuckData
  /** True when the page was just converted from the block editor and has not been saved here yet. */
  imported?: boolean
  slug?: string
  status?: string
  templates: BuilderTemplate[]
  title: string
}

type Ctx = {
  collection: EditorProps['collection']
  message: string
  openTemplates: () => void
  save: (data: Data, status: 'draft' | 'published') => Promise<void>
  saving: boolean
  slug?: string
}

const EditorContext = createContext<Ctx | null>(null)
const useEditor = () => useContext(EditorContext) as Ctx
const usePuck = createUsePuck()

// ── Content / Style / Advanced tabs in the settings panel ────────────────

const tabs: { icon: React.ReactNode; id: FieldTab; label: string }[] = [
  { id: 'content', icon: <Pencil size={15} />, label: 'Content' },
  { id: 'style', icon: <Paintbrush size={15} />, label: 'Style' },
  { id: 'advanced', icon: <Settings2 size={15} />, label: 'Advanced' },
]

const FieldTabs = ({ children, fields }: { children: React.ReactNode; fields?: Record<string, React.ReactNode> }) => {
  const selectedId = usePuck((s) => s.selectedItem?.props?.id as string | undefined)
  const [tab, setTab] = useState<FieldTab>('content')

  // Each newly selected element opens on its Content tab, like Elementor.
  useEffect(() => setTab('content'), [selectedId])

  // Page-level settings (nothing selected) have no tabs.
  if (!selectedId || !fields) return <>{children}</>

  const visible = Object.keys(fields).filter((name) => tabOf(name) === tab && fields[name])

  return (
    <div className="sfb-panel">
      <div aria-label="Element settings" className="sfb-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            aria-selected={tab === t.id}
            className="sfb-tab"
            key={t.id}
            onClick={() => setTab(t.id)}
            role="tab"
            type="button"
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="sfb-tabpanel" role="tabpanel">
        {visible.length ? (
          visible.map((name) => (
            <div className="sfb-field" key={name}>
              {fields[name]}
            </div>
          ))
        ) : (
          <p className="sfb-hint">
            This element has no content options. Drop other elements inside it on the canvas, and
            use the Style and Advanced tabs to change how it looks.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Header buttons ───────────────────────────────────────────────────────

const HeaderActions = ({ children }: { children: React.ReactNode }) => {
  const { collection, message, openTemplates, save, saving, slug } = useEditor()
  const getPuck = useGetPuck()

  return (
    <>
      {message && (
        <span aria-live="polite" className="sfb-status">
          {message}
        </span>
      )}
      <a className="sfb-btn" href="/admin/builder">
        ← Dashboard
      </a>
      {collection === 'pages' && (
        <>
          <button className="sfb-btn" onClick={openTemplates} type="button">
            <Layers size={15} /> Templates
          </button>
          {slug && (
            <a
              className="sfb-btn"
              href={slug === 'home' ? '/' : `/${slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              View page ↗
            </a>
          )}
          <button
            className="sfb-btn"
            disabled={saving}
            onClick={() => save(getPuck().appState.data, 'draft')}
            type="button"
          >
            Save draft
          </button>
        </>
      )}
      {children}
    </>
  )
}

/** Gives the canvas iframe the same fonts and theme attribute as the live site. */
const Canvas = ({ children, document }: { children: React.ReactNode; document?: Document }) => {
  useEffect(() => {
    if (!document) return
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.className = fontVariables
  }, [document])
  return <>{children}</>
}

// ── Templates dialog (the same templates as /admin/templates) ────────────

const TemplatesDialog = ({ onClose, templates }: { onClose: () => void; templates: BuilderTemplate[] }) => {
  const getPuck = useGetPuck()
  const [confirm, setConfirm] = useState<null | string>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const apply = (template: BuilderTemplate, mode: 'insert' | 'replace') => {
    const { appState, dispatch } = getPuck()
    const added = reId(template.data.content)
    dispatch({
      type: 'setData',
      data: {
        ...appState.data,
        content: mode === 'replace' ? added : [...appState.data.content, ...added],
      } as any,
    })
    onClose()
  }

  return (
    <div className="sfb-overlay" onClick={onClose}>
      <div
        aria-label="Templates"
        aria-modal="true"
        className="sfb-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <h2>Templates</h2>
            <p>Insert a template below what is already on the page, or replace the page with it.</p>
          </div>
          <button aria-label="Close" className="sfb-btn" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </header>
        <div className="sfb-templates">
          {templates.map((template) => (
            <article key={template.id}>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <small>{template.data.content.length} sections</small>
              <footer>
                <button
                  className="sfb-btn sfb-btn--primary"
                  onClick={() => apply(template, 'insert')}
                  type="button"
                >
                  Insert
                </button>
                {confirm === template.id ? (
                  <button
                    className="sfb-btn sfb-btn--danger"
                    onClick={() => apply(template, 'replace')}
                    type="button"
                  >
                    Confirm replace
                  </button>
                ) : (
                  <button className="sfb-btn" onClick={() => setConfirm(template.id)} type="button">
                    Replace page
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Editor ───────────────────────────────────────────────────────────────

const overrides = { fields: FieldTabs, headerActions: HeaderActions, iframe: Canvas } as any

export const Editor: React.FC<EditorProps> = ({
  collection,
  header,
  id,
  imported,
  initialData,
  slug,
  status,
  templates,
  title,
}) => {
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [message, setMessage] = useState(
    imported ? 'Imported from the block editor — not saved yet' : status === 'draft' ? 'Draft' : '',
  )

  const save = useCallback(
    async (current: Data, target: 'draft' | 'published') => {
      const data = stripResolved(current)
      setSaving(true)
      setMessage('Saving…')
      const pageTitle = (data.root as any)?.props?.title || title
      const body =
        collection === 'pages'
          ? { _status: target, editor: 'visual', puckData: data, title: pageTitle }
          : { puckData: data, title: pageTitle }
      try {
        const res = await fetch(
          `/api/${collection}/${id}${collection === 'pages' && target === 'draft' ? '?draft=true' : ''}`,
          {
            body: JSON.stringify(body),
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
          },
        )
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          throw new Error(json?.errors?.[0]?.message || `Save failed (${res.status})`)
        }
        const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        setMessage(
          collection === 'sections'
            ? `Saved ${time} — live on every page that uses it`
            : target === 'published'
              ? `Published ${time}`
              : `Draft saved ${time}`,
        )
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Save failed')
      } finally {
        setSaving(false)
      }
    },
    [collection, id, title],
  )

  const context = useMemo<Ctx>(
    () => ({
      collection,
      message,
      openTemplates: () => setShowTemplates(true),
      save,
      saving,
      slug,
    }),
    [collection, message, save, saving, slug],
  )

  return (
    <EditorContext.Provider value={context}>
      <Puck
        config={collection === 'sections' ? sectionConfig : pageConfig}
        data={initialData as any}
        headerPath={collection === 'sections' ? 'Global section' : slug ? `/${slug}` : undefined}
        headerTitle={title}
        metadata={{ header }}
        onPublish={(data) => save(data, 'published')}
        overrides={overrides}
      >
        <Puck.Layout />
        {showTemplates && (
          <TemplatesDialog onClose={() => setShowTemplates(false)} templates={templates} />
        )}
      </Puck>
    </EditorContext.Provider>
  )
}
