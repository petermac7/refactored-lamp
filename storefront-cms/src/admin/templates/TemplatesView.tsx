import type { AdminViewServerProps } from 'payload'

import React from 'react'

import { templates } from '@/templates'

import { AdminShell } from '../AdminShell'
import { TemplatesClient } from './TemplatesClient'

export default function TemplatesView(props: AdminViewServerProps) {
  const cards = templates.map(({ id, name, blocks, collection, description }) => ({
    id,
    name,
    blocks,
    collection,
    description,
  }))

  return (
    <AdminShell
      {...props}
      intro="Start a page or blog post from a pre-made layout instead of a blank screen."
      title="Templates"
    >
      <TemplatesClient templates={cards} />
    </AdminShell>
  )
}
