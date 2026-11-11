import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { authenticated } from '../access/authenticated'

/**
 * Global sections: built once in the Visual Builder and reused on any number of pages.
 * Pages store only a reference, so editing a section updates every page that uses it.
 */
export const Sections: CollectionConfig = {
  slug: 'sections',
  labels: { plural: 'Global Sections', singular: 'Global Section' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'updatedAt'],
    description: 'Reusable sections for the Visual Builder. Edit one and every page using it updates.',
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'openBuilder',
      type: 'ui',
      admin: {
        components: { Field: '@/admin/builder/OpenBuilderButton#OpenBuilderButton' },
      },
    },
    { name: 'puckData', type: 'json', admin: { hidden: true } },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { context, payload } }) => {
        if (!context.disableRevalidate) {
          payload.logger.info(`Global section "${doc.title}" changed — revalidating all pages`)
          revalidatePath('/', 'layout')
        }
        return doc
      },
    ],
  },
}
