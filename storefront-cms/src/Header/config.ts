import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'brandName',
          type: 'text',
          defaultValue: 'Your Brand',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'followUrl',
          type: 'text',
          label: 'Follow button URL',
          admin: {
            description: 'Where the Follow button goes (social profile, newsletter…). Optional.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Without a logo, a mark is generated from the brand name.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'showFollow', type: 'checkbox', defaultValue: true, label: 'Show Follow button' },
        { name: 'showShare', type: 'checkbox', defaultValue: true, label: 'Show Share button' },
        { name: 'showSearch', type: 'checkbox', defaultValue: true, label: 'Show search box' },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'boxed',
          type: 'checkbox',
          label: 'Show as outlined button',
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown links',
          admin: { initCollapsed: true },
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 10,
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
