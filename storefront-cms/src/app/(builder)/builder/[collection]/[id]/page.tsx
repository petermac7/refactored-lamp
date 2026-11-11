/* eslint-disable @typescript-eslint/no-explicit-any */
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { builderBlocks } from '@/blocks/builder/config'
import { Editor } from '@/builder/Editor'
import { emptyData, slimMedia, toPuck } from '@/builder/shared'
import { makeContext, templates } from '@/templates'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ collection: string; id: string }> }

/**
 * The Visual Builder screen. Opened from the Payload dashboard
 * (Visual Builder list, or the "Open in Visual Builder" button on a page).
 */
export default async function BuilderPage({ params }: Args) {
  const { id, collection } = await params
  if (collection !== 'pages' && collection !== 'sections') notFound()

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect(`/admin/login?redirect=${encodeURIComponent(`/builder/${collection}/${id}`)}`)

  let doc: any
  try {
    doc = await payload.findByID({ id, collection, depth: 1, draft: true, overrideAccess: false, user })
  } catch {
    notFound()
  }

  const [media, forms, header] = await Promise.all([
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 24,
      sort: 'createdAt',
      where: { mimeType: { contains: 'image' } },
    }),
    payload.find({ collection: 'forms', depth: 0, limit: 1, sort: 'createdAt' }),
    payload.findGlobal({ slug: 'header', depth: 2 }),
  ])

  const sectionTypes = builderBlocks.map((block) => block.slug)

  // The same templates as /admin/templates, converted for the canvas — never a second copy.
  const context = makeContext(media.docs, forms.docs[0], slimMedia)
  const builderTemplates = templates
    .filter((template) => template.collection === 'pages' && template.id !== 'blank-page')
    .map((template) => ({
      id: template.id,
      name: template.name,
      data: toPuck(template.build(context), sectionTypes),
      description: template.description,
    }))

  // A page not yet edited here opens with its block-editor content converted to builder elements.
  const saved = doc.puckData?.content ? doc.puckData : null
  const initialData =
    saved || (collection === 'pages' ? toPuck(doc, sectionTypes) : emptyData(doc.title))
  initialData.root = { props: { ...initialData.root?.props, title: doc.title } }

  return (
    <Editor
      collection={collection}
      header={JSON.parse(JSON.stringify(header))}
      id={doc.id}
      imported={collection === 'pages' && !saved}
      initialData={JSON.parse(JSON.stringify(initialData))}
      slug={doc.slug}
      status={doc._status}
      templates={JSON.parse(JSON.stringify(builderTemplates))}
      title={doc.title}
    />
  )
}
