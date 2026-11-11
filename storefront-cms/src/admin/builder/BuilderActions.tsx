'use client'
import React, { useState } from 'react'

/** "New page" / "New global section" buttons on the Visual Builder list. */
export const BuilderActions: React.FC<{ kind: 'pages' | 'sections' }> = ({ kind }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      // New pages start from the shared "Blank Page" template, so there is one definition of it.
      const res =
        kind === 'pages'
          ? await fetch('/api/templates/blank-page/create', { credentials: 'include', method: 'POST' })
          : await fetch('/api/sections', {
              body: JSON.stringify({ title: 'New global section' }),
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            })
      const json = await res.json()
      const id = json?.id ?? json?.doc?.id
      if (!res.ok || !id) throw new Error(json?.error || json?.errors?.[0]?.message || 'Could not create')
      window.location.href = `/builder/${kind}/${id}`
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <span>
      <button className="sfa-btn sfa-btn--primary" disabled={busy} onClick={create} type="button">
        {busy ? 'Creating…' : kind === 'pages' ? 'New page' : 'New global section'}
      </button>
      {error && (
        <span className="sfa-muted" role="alert" style={{ marginLeft: '0.75rem' }}>
          {error}
        </span>
      )}
    </span>
  )
}
