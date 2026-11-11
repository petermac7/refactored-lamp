/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload'

import { slimPost, walk } from './shared'

/**
 * Fills in the parts of a builder page that live elsewhere, at render time:
 * global sections (always their current content) and "Latest Posts" lists.
 * This is what lets one section be reused on many pages without copies.
 */
export const hydratePuck = async (source: any, payload: Payload, depth = 0): Promise<any> => {
  const data = structuredClone(source)

  await walk(data, async (item) => {
    if (item.type === 'posts') {
      const posts = await payload.find({
        collection: 'posts',
        depth: 1,
        limit: Math.min(Number(item.props.limit) || 3, 12),
        overrideAccess: false,
        sort: '-publishedAt',
      })
      item.props.posts = posts.docs.map(slimPost)
    }

    if (item.type === 'globalSection') {
      const id = item.props.section?.id
      item.props.data = undefined
      if (id && depth === 0) {
        try {
          const section = await payload.findByID({ collection: 'sections', id, depth: 1 })
          if (section?.puckData) {
            item.props.data = await hydratePuck(section.puckData, payload, depth + 1)
          }
        } catch {
          // The section was deleted — render nothing in its place.
        }
      }
    }
  })

  return data
}
