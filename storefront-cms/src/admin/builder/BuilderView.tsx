import type { AdminViewServerProps } from 'payload'

import Link from 'next/link'
import React from 'react'

import { AdminShell } from '../AdminShell'
import { BuilderActions } from './BuilderActions'

export default async function BuilderView(props: AdminViewServerProps) {
  const { payload, user } = props.initPageResult.req

  const [pages, sections] = user
    ? await Promise.all([
        payload.find({
          collection: 'pages',
          depth: 0,
          draft: true,
          limit: 200,
          select: { _status: true, editor: true, slug: true, title: true, updatedAt: true },
          sort: 'title',
        }),
        payload.find({ collection: 'sections', depth: 0, limit: 200, sort: 'title' }),
      ])
    : [{ docs: [] }, { docs: [] }]

  const date = (iso: string) => new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short' })

  return (
    <AdminShell
      {...props}
      intro="Drag-and-drop editing with Content, Style and Advanced tabs. Pick a page to open it on the canvas."
      title="Visual Builder"
    >
      <section className="sfa-section">
        <div className="sfa-toolbar">
          <h2>Pages</h2>
          <span style={{ display: 'flex', gap: '0.5rem' }}>
            <Link className="sfa-btn" href="/admin/templates">
              Start from a template
            </Link>
            <BuilderActions kind="pages" />
          </span>
        </div>
        <table className="sfa-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">Status</th>
              <th scope="col">Live page uses</th>
              <th scope="col">Updated</th>
              <th scope="col">
                <span className="sfa-sr">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.docs.map((page) => (
              <tr key={page.id}>
                <td>
                  <strong>{page.title}</strong>
                  <br />
                  <code>/{page.slug === 'home' ? '' : page.slug}</code>
                </td>
                <td>{page._status === 'published' ? 'Published' : 'Draft'}</td>
                <td>{page.editor === 'visual' ? 'Visual Builder' : 'Block editor'}</td>
                <td>{date(page.updatedAt)}</td>
                <td className="sfa-table__actions">
                  <a className="sfa-btn sfa-btn--primary" href={`/builder/pages/${page.id}`}>
                    Open builder
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sfa-section">
        <div className="sfa-toolbar">
          <div>
            <h2>Global sections</h2>
            <p className="sfa-muted" style={{ margin: 0 }}>
              Build a section once and drop it on any page with the “Global Section” element. Edit
              it here and every page updates — nothing is copied.
            </p>
          </div>
          <BuilderActions kind="sections" />
        </div>
        {sections.docs.length === 0 ? (
          <p className="sfa-empty">No global sections yet.</p>
        ) : (
          <table className="sfa-table">
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="sfa-sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.docs.map((section) => (
                <tr key={section.id}>
                  <td>
                    <strong>{section.title}</strong>
                  </td>
                  <td>{date(section.updatedAt)}</td>
                  <td className="sfa-table__actions">
                    <a className="sfa-btn sfa-btn--primary" href={`/builder/sections/${section.id}`}>
                      Open builder
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminShell>
  )
}
