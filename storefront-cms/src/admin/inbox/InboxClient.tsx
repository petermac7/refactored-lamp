'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

type Submission = {
  createdAt: string
  form: { id: number | string; title?: string } | number | string
  id: number | string
  read?: boolean | null
  submissionData?: { field: string; value: string }[] | null
}

const fieldValue = (s: Submission, ...names: string[]) => {
  const rows = s.submissionData || []
  for (const name of names) {
    const hit = rows.find((row) => row.field.toLowerCase().replace(/[^a-z]/g, '').includes(name))
    if (hit?.value) return String(hit.value)
  }
  return ''
}

const sender = (s: Submission) => fieldValue(s, 'name') || fieldValue(s, 'email') || 'Anonymous'
const formTitle = (s: Submission) =>
  typeof s.form === 'object' ? s.form.title || 'Form' : `Form ${s.form}`

const when = (iso: string) => {
  const date = new Date(iso)
  const today = new Date().toDateString() === date.toDateString()
  return today
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

const label = (field: string) =>
  field.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export const InboxClient: React.FC = () => {
  const [items, setItems] = useState<Submission[]>([])
  const [state, setState] = useState<'error' | 'loading' | 'ready'>('loading')
  const [selectedId, setSelectedId] = useState<null | number | string>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/form-submissions?limit=200&sort=-createdAt&depth=1', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      setItems(json.docs || [])
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setRead = useCallback(async (id: number | string, read: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read } : item)))
    window.dispatchEvent(new Event('sf-inbox-changed'))
    await fetch(`/api/form-submissions/${id}`, {
      body: JSON.stringify({ read }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
    window.dispatchEvent(new Event('sf-inbox-changed'))
  }, [])

  const open = (item: Submission) => {
    setSelectedId(item.id)
    setConfirmDelete(false)
    if (!item.read) void setRead(item.id, true)
  }

  const remove = async (id: number | string) => {
    await fetch(`/api/form-submissions/${id}`, { credentials: 'include', method: 'DELETE' })
    setItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedId(null)
    setConfirmDelete(false)
    window.dispatchEvent(new Event('sf-inbox-changed'))
  }

  const unread = items.filter((item) => !item.read).length
  const visible = useMemo(
    () => (filter === 'unread' ? items.filter((item) => !item.read) : items),
    [items, filter],
  )
  const selected = items.find((item) => item.id === selectedId) || null
  const email = selected ? fieldValue(selected, 'email') : ''

  if (state === 'loading') return <p className="sfa-empty">Loading messages…</p>
  if (state === 'error')
    return (
      <p className="sfa-error" role="alert">
        Could not load messages.{' '}
        <button className="sfa-link" onClick={load} type="button">
          Try again
        </button>
      </p>
    )

  return (
    <div>
      <div className="sfa-toolbar">
        <div className="sfa-tabs" role="tablist">
          <button
            aria-selected={filter === 'all'}
            className="sfa-tab"
            onClick={() => setFilter('all')}
            role="tab"
            type="button"
          >
            All ({items.length})
          </button>
          <button
            aria-selected={filter === 'unread'}
            className="sfa-tab"
            onClick={() => setFilter('unread')}
            role="tab"
            type="button"
          >
            Unread ({unread})
          </button>
        </div>
        <button className="sfa-btn" onClick={load} type="button">
          Refresh
        </button>
      </div>

      <div className="sfa-inbox">
        <ul aria-label="Messages" className="sfa-inbox__list">
          {visible.length === 0 && (
            <li className="sfa-empty">
              {items.length === 0
                ? 'No messages yet. Submissions from your contact form will appear here.'
                : 'No unread messages.'}
            </li>
          )}
          {visible.map((item) => (
            <li key={item.id}>
              <button
                aria-current={item.id === selectedId}
                className={`sfa-msg ${item.read ? '' : 'sfa-msg--unread'}`}
                onClick={() => open(item)}
                type="button"
              >
                <span className="sfa-msg__top">
                  <span className="sfa-msg__from">
                    {!item.read && <span aria-label="Unread" className="sfa-dot" />}
                    {sender(item)}
                  </span>
                  <time dateTime={item.createdAt}>{when(item.createdAt)}</time>
                </span>
                <span className="sfa-msg__preview">
                  {fieldValue(item, 'message', 'comment', 'subject') || formTitle(item)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sfa-inbox__detail">
          {!selected ? (
            <p className="sfa-empty">Select a message to read it.</p>
          ) : (
            <>
              <header className="sfa-detail__head">
                <div>
                  <h2>{sender(selected)}</h2>
                  <p className="sfa-muted">
                    {formTitle(selected)} · {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="sfa-detail__actions">
                  {email && (
                    <a className="sfa-btn sfa-btn--primary" href={`mailto:${email}`}>
                      Reply by email
                    </a>
                  )}
                  <button
                    className="sfa-btn"
                    onClick={() => setRead(selected.id, !selected.read)}
                    type="button"
                  >
                    Mark as {selected.read ? 'unread' : 'read'}
                  </button>
                  {confirmDelete ? (
                    <button
                      className="sfa-btn sfa-btn--danger"
                      onClick={() => remove(selected.id)}
                      type="button"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button className="sfa-btn" onClick={() => setConfirmDelete(true)} type="button">
                      Delete
                    </button>
                  )}
                </div>
              </header>
              <dl className="sfa-fields">
                {(selected.submissionData || []).map((row, i) => (
                  <div key={i}>
                    <dt>{label(row.field)}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
