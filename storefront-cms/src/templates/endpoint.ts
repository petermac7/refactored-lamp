import type { Endpoint } from 'payload'

import { makeContext, templates } from './index'

/**
 * POST /api/templates/:id/create
 * Creates a new draft page or post from a pre-made template and returns its ID.
 */
export const createFromTemplate: Endpoint = {
  method: 'post',
  path: '/templates/:id/create',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const template = templates.find((t) => t.id === req.routeParams?.id)
    if (!template) return Response.json({ error: 'Template not found' }, { status: 404 })

    const { payload } = req

    const [media, forms] = await Promise.all([
      payload.find({
        collection: 'media',
        depth: 0,
        limit: 12,
        sort: 'createdAt',
        where: { mimeType: { contains: 'image' } },
      }),
      payload.find({ collection: 'forms', depth: 0, limit: 1, sort: 'createdAt' }),
    ])

    const data = template.build(makeContext(media.docs, forms.docs[0]?.id))

    try {
      const doc = await payload.create({
        collection: template.collection,
        context: { disableRevalidate: true },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          ...data,
          _status: 'draft',
          generateSlug: false,
          slug: `${template.id.replace(/^post-/, '')}-${Date.now().toString(36)}`,
        } as any,
        draft: true,
        req,
      })

      return Response.json({ id: doc.id, collection: template.collection })
    } catch (error) {
      payload.logger.error({ err: error, msg: `Failed to create from template ${template.id}` })
      return Response.json(
        { error: error instanceof Error ? error.message : 'Could not create from template' },
        { status: 500 },
      )
    }
  },
}
