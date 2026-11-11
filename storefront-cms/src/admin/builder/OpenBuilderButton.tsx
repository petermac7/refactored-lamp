'use client'
import { useDocumentInfo } from '@payloadcms/ui'
import React from 'react'

import '../admin.css'

/** Sidebar button on a page or global section that opens it in the Visual Builder. */
export const OpenBuilderButton: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo()

  if (!id) {
    return <p className="sfa-muted">Save this document first to open it in the Visual Builder.</p>
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <a className="sfa-btn sfa-btn--primary" href={`/builder/${collectionSlug}/${id}`}>
        Open in Visual Builder
      </a>
    </div>
  )
}
