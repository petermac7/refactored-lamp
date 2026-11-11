import type { Block, Field } from 'payload'

/**
 * Builder blocks — the "default elements" available in the page builder,
 * on top of the template's Content, Media, Call to Action, Archive and Form blocks.
 */

const image = (name = 'image', label = 'Image'): Field => ({
  name,
  type: 'upload',
  label,
  relationTo: 'media',
})

const sectionTitle: Field[] = [
  { name: 'title', type: 'text', label: 'Section title' },
  { name: 'subtitle', type: 'textarea', label: 'Section subtitle' },
]

const columns = (defaultValue = '3'): Field => ({
  name: 'columns',
  type: 'select',
  defaultValue,
  options: [
    { label: '2 columns', value: '2' },
    { label: '3 columns', value: '3' },
    { label: '4 columns', value: '4' },
  ],
})

export const iconOptions = [
  'star',
  'heart',
  'shield',
  'truck',
  'leaf',
  'droplet',
  'zap',
  'award',
  'clock',
  'smile',
  'package',
  'refresh',
] as const

export const HeadingBlock: Block = {
  slug: 'heading',
  interfaceName: 'HeadingBlock',
  labels: { singular: 'Heading', plural: 'Headings' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'textarea' },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
  ],
}

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    ...sectionTitle,
    columns('3'),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'star',
          options: iconOptions.map((value) => ({
            label: value.charAt(0).toUpperCase() + value.slice(1),
            value,
          })),
        },
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}

export const ProductGridBlock: Block = {
  slug: 'productGrid',
  interfaceName: 'ProductGridBlock',
  labels: { singular: 'Product Grid', plural: 'Product Grids' },
  fields: [
    ...sectionTitle,
    columns('4'),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        image(),
        { name: 'name', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'text', admin: { width: '33%' } },
            { name: 'compareAtPrice', type: 'text', admin: { width: '33%' } },
            { name: 'badge', type: 'text', admin: { width: '33%', placeholder: 'New' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'rating',
              type: 'number',
              min: 0,
              max: 5,
              admin: { width: '33%', step: 0.1 },
            },
            { name: 'buttonLabel', type: 'text', admin: { width: '33%' } },
            { name: 'url', type: 'text', label: 'Link URL', admin: { width: '33%' } },
          ],
        },
      ],
    },
  ],
}

export const PromoTilesBlock: Block = {
  slug: 'promoTiles',
  interfaceName: 'PromoTilesBlock',
  labels: { singular: 'Promo Tiles', plural: 'Promo Tiles' },
  fields: [
    ...sectionTitle,
    columns('3'),
    {
      name: 'tiles',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        image(),
        { name: 'label', type: 'text', required: true },
        { name: 'caption', type: 'text' },
        { name: 'url', type: 'text', label: 'Link URL' },
      ],
    },
  ],
}

export const SplitContentBlock: Block = {
  slug: 'splitContent',
  interfaceName: 'SplitContentBlock',
  labels: { singular: 'Image + Text', plural: 'Image + Text' },
  fields: [
    image(),
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image left', value: 'left' },
        { label: 'Image right', value: 'right' },
      ],
    },
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'buttonLabel', type: 'text', admin: { width: '50%' } },
        { name: 'buttonUrl', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Image Gallery', plural: 'Image Galleries' },
  fields: [
    ...sectionTitle,
    columns('3'),
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [image(), { name: 'caption', type: 'text' }],
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    ...sectionTitle,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'role', type: 'text', admin: { width: '40%' } },
            {
              name: 'rating',
              type: 'number',
              min: 1,
              max: 5,
              defaultValue: 5,
              admin: { width: '20%' },
            },
          ],
        },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: { singular: 'FAQ Accordion', plural: 'FAQ Accordions' },
  fields: [
    ...sectionTitle,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const PricingBlock: Block = {
  slug: 'pricing',
  interfaceName: 'PricingBlock',
  labels: { singular: 'Pricing Table', plural: 'Pricing Tables' },
  fields: [
    ...sectionTitle,
    {
      name: 'plans',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'price', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'period', type: 'text', admin: { width: '30%', placeholder: '/month' } },
          ],
        },
        { name: 'description', type: 'text' },
        { name: 'features', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
        {
          type: 'row',
          fields: [
            { name: 'buttonLabel', type: 'text', admin: { width: '40%' } },
            { name: 'buttonUrl', type: 'text', admin: { width: '40%' } },
            { name: 'featured', type: 'checkbox', admin: { width: '20%' } },
          ],
        },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stats', plural: 'Stats' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
          ],
        },
      ],
    },
  ],
}

export const LogoCloudBlock: Block = {
  slug: 'logoCloud',
  interfaceName: 'LogoCloudBlock',
  labels: { singular: 'Logo Cloud', plural: 'Logo Clouds' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      fields: [image('image', 'Logo'), { name: 'name', type: 'text', required: true }],
    },
  ],
}

export const TeamBlock: Block = {
  slug: 'team',
  interfaceName: 'TeamBlock',
  labels: { singular: 'Team', plural: 'Teams' },
  fields: [
    ...sectionTitle,
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        image('photo', 'Photo'),
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'bio', type: 'textarea' },
      ],
    },
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube or Vimeo URL',
    },
    { name: 'caption', type: 'text' },
  ],
}

export const ButtonGroupBlock: Block = {
  slug: 'buttonGroup',
  interfaceName: 'ButtonGroupBlock',
  labels: { singular: 'Buttons', plural: 'Buttons' },
  fields: [
    {
      name: 'align',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
    {
      name: 'buttons',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'url', type: 'text', required: true, admin: { width: '40%' } },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'primary',
              admin: { width: '30%' },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Outline', value: 'outline' },
              ],
            },
          ],
        },
        { name: 'newTab', type: 'checkbox', label: 'Open in new tab' },
      ],
    },
  ],
}

export const SpacerBlock: Block = {
  slug: 'spacer',
  interfaceName: 'SpacerBlock',
  labels: { singular: 'Spacer / Divider', plural: 'Spacers / Dividers' },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    { name: 'showLine', type: 'checkbox', label: 'Show divider line' },
  ],
}

export const builderBlocks: Block[] = [
  HeadingBlock,
  SplitContentBlock,
  FeatureGridBlock,
  ProductGridBlock,
  PromoTilesBlock,
  GalleryBlock,
  TestimonialsBlock,
  FAQBlock,
  PricingBlock,
  StatsBlock,
  LogoCloudBlock,
  TeamBlock,
  VideoEmbedBlock,
  ButtonGroupBlock,
  SpacerBlock,
]
