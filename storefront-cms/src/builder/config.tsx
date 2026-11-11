'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config, Field } from '@puckeditor/core'

import { Render } from '@puckeditor/core'
import React from 'react'

import * as Sections from '@/blocks/builder/Component'
import { builderBlocks } from '@/blocks/builder/config'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { CollectionArchive } from '@/components/CollectionArchive'
import { Media } from '@/components/Media'
import { HeaderClient } from '@/Header/Component.client'
import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { StorefrontHero } from '@/heros/Storefront'
import { makeContext, templates } from '@/templates'
import { h, p, rich } from '@/templates/lexical'

import { advancedFields, docField, fieldsFromPayload, mediaField, styleFields } from './fields'
import { Shell } from './Shell'
import { shellDefaults, slimPost, toPuck } from './shared'

/**
 * Visual builder configuration.
 *
 * Nothing about a section is declared twice:
 *  - its fields come from the Payload block definition (src/blocks/builder/config.ts)
 *  - it renders with the same React component the block editor uses
 *  - its starting content is taken from the shared templates (src/templates)
 */

// ── The section components, keyed by their block slug ────────────────────

const sectionComponents: Record<string, React.FC<any>> = {
  buttonGroup: Sections.ButtonGroupBlock,
  faq: Sections.FAQBlock,
  featureGrid: Sections.FeatureGridBlock,
  gallery: Sections.GalleryBlock,
  heading: Sections.HeadingBlock,
  logoCloud: Sections.LogoCloudBlock,
  pricing: Sections.PricingBlock,
  productGrid: Sections.ProductGridBlock,
  promoTiles: Sections.PromoTilesBlock,
  spacer: Sections.SpacerBlock,
  splitContent: Sections.SplitContentBlock,
  stats: Sections.StatsBlock,
  team: Sections.TeamBlock,
  testimonials: Sections.TestimonialsBlock,
  videoEmbed: Sections.VideoEmbedBlock,
}

export const sectionTypes = Object.keys(sectionComponents)

// ── Starting content: the first use of each element in the shared templates ──

const fallbackDefaults: Record<string, any> = {
  spacer: { showLine: true, size: 'md' },
  videoEmbed: { title: 'Watch the video', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
}

const templateDefaults = (() => {
  const found: Record<string, any> = {}
  for (const template of templates.filter((t) => t.collection === 'pages')) {
    for (const item of toPuck(template.build(makeContext([])), sectionTypes).content) {
      if (!found[item.type]) {
        const { id: _id, ...props } = item.props
        found[item.type] = props
      }
    }
  }
  return found
})()

const defaultsFor = (type: string) => templateDefaults[type] || fallbackDefaults[type] || {}

// ── Element factory: adds the shared Style / Advanced options and wrapper ──

type ElementDef = {
  defaults?: Record<string, any>
  fields: Record<string, Field>
  label: string
  margin?: 'lg' | 'none' | 'sm'
  render: (props: any) => React.ReactNode
  resolveData?: any
}

const element = ({ defaults = {}, fields, label, margin = 'lg', render, resolveData }: ElementDef) => ({
  defaultProps: { ...defaults, ...shellDefaults(margin) },
  fields: { ...fields, ...styleFields, ...advancedFields },
  label,
  render: (props: any) => (
    <Shell editing={props.puck?.isEditing} p={props}>
      {render(props)}
    </Shell>
  ),
  ...(resolveData ? { resolveData } : {}),
})

const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="container">
    <p className="sfb-placeholder">{children}</p>
  </div>
)

const button = (label?: string, url?: string) =>
  label && url ? [{ link: { type: 'custom', appearance: 'default', label, url } }] : []

// ── Sections generated from the Payload blocks ───────────────────────────

const generated = Object.fromEntries(
  builderBlocks
    .filter((block) => sectionComponents[block.slug])
    .map((block) => {
      const Component = sectionComponents[block.slug]
      const defaults = defaultsFor(block.slug)
      return [
        block.slug,
        element({
          defaults,
          fields: fieldsFromPayload(block.fields, defaults),
          label: String((block.labels as any)?.singular || block.slug),
          margin: block.slug === 'spacer' ? 'none' : 'lg',
          render: (props) => <Component {...props} />,
        }),
      ]
    }),
)

// ── Elements that need more than a 1:1 mapping ───────────────────────────

const textFields = {
  title: { type: 'text', label: 'Title' } as Field,
  text: { type: 'textarea', label: 'Text' } as Field,
  buttonLabel: { type: 'text', label: 'Button label' } as Field,
  buttonUrl: { type: 'text', label: 'Button link' } as Field,
}

const custom = {
  section: element({
    label: 'Section',
    margin: 'none',
    defaults: { content: [], sPadBottom: 'lg', sPadTop: 'lg' },
    fields: { content: { type: 'slot', label: 'Content' } },
    render: ({ content: Content }) => <Content className="sfb-slot" />,
  }),

  columns: element({
    label: 'Columns',
    defaults: { c1: [], c2: [], c3: [], c4: [], gap: 'md', layout: '1-1' },
    fields: {
      layout: {
        type: 'select',
        label: 'Layout',
        options: [
          { label: '2 columns', value: '1-1' },
          { label: '3 columns', value: '1-1-1' },
          { label: '4 columns', value: '1-1-1-1' },
          { label: 'Narrow + wide', value: '1-2' },
          { label: 'Wide + narrow', value: '2-1' },
        ],
      },
      gap: {
        type: 'select',
        label: 'Gap',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
      },
      c1: { type: 'slot' },
      c2: { type: 'slot' },
      c3: { type: 'slot' },
      c4: { type: 'slot' },
    },
    render: ({ c1, c2, c3, c4, gap, layout }) => {
      const parts = String(layout || '1-1').split('-')
      const slots = [c1, c2, c3, c4].slice(0, parts.length)
      return (
        <div className="container">
          <div
            className={`sfb-cols sfb-gap-${gap || 'md'}`}
            style={{ gridTemplateColumns: parts.map((n) => `minmax(0, ${n}fr)`).join(' ') }}
          >
            {slots.map((Slot: any, i: number) => (
              <Slot className="sfb-slot" key={i} />
            ))}
          </div>
        </div>
      )
    },
  }),

  text: element({
    label: 'Text Editor',
    margin: 'sm',
    defaults: {
      text: '<h2>Add a heading</h2><p>Click to edit this text. Use the toolbar for bold, italic, lists and links.</p>',
    },
    fields: { text: { type: 'richtext', label: 'Text' } },
    render: ({ text }) => (
      <div className="container">
        <div className="prose md:prose-md dark:prose-invert max-w-none">{text}</div>
      </div>
    ),
  }),

  image: element({
    label: 'Image',
    margin: 'sm',
    defaults: { caption: '', link: '', size: 'full' },
    fields: {
      media: mediaField('Image'),
      size: {
        type: 'select',
        label: 'Width',
        options: [
          { label: 'Full', value: 'full' },
          { label: 'Large', value: 'lg' },
          { label: 'Medium', value: 'md' },
          { label: 'Small', value: 'sm' },
        ],
      },
      caption: { type: 'text', label: 'Caption' },
      link: { type: 'text', label: 'Link URL' },
    },
    render: ({ caption, link, media, size }) => {
      if (!media) return <Placeholder>Choose an image in the Content tab</Placeholder>
      const image = <Media imgClassName="h-auto w-full rounded-lg" resource={media} />
      return (
        <div className="container">
          <figure className={`sfb-img sfb-img-${size || 'full'}`}>
            {link ? <a href={link}>{image}</a> : image}
            {caption && (
              <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
            )}
          </figure>
        </div>
      )
    },
  }),

  storefrontBanner: element({
    label: 'Storefront Banner',
    margin: 'none',
    defaults: { eyebrow: 'Your Brand', headline: 'New Collection', tagline: 'Out now' },
    fields: {
      media: mediaField('Banner image'),
      eyebrow: { type: 'text', label: 'Eyebrow' },
      headline: { type: 'text', label: 'Script headline' },
      tagline: { type: 'text', label: 'Tagline' },
    },
    render: (props) => <StorefrontHero {...props} type="storefront" />,
  }),

  hero: element({
    label: 'Hero',
    margin: 'none',
    defaults: {
      buttonLabel: '',
      buttonUrl: '',
      text: 'One or two sentences on who this is for and why it is worth their time.',
      title: 'The headline that explains your offer',
      variant: 'lowImpact',
    },
    fields: {
      variant: {
        type: 'select',
        label: 'Style',
        options: [
          { label: 'Text only', value: 'lowImpact' },
          { label: 'Text above image', value: 'mediumImpact' },
          { label: 'Text over image', value: 'highImpact' },
        ],
      },
      ...textFields,
      media: mediaField('Image'),
    },
    render: ({ buttonLabel, buttonUrl, media, text, title, variant }) => {
      const hero: any = {
        type: variant,
        links: button(buttonLabel, buttonUrl),
        media,
        richText: rich(h('h1', title || ''), ...(text ? [p(text)] : [])),
      }
      if (variant === 'highImpact' && media) return <HighImpactHero {...hero} />
      if (variant === 'mediumImpact') return <MediumImpactHero {...hero} />
      return <LowImpactHero {...hero} />
    },
  }),

  cta: element({
    label: 'Call to Action',
    defaults: {
      buttonLabel: 'Shop now',
      buttonUrl: '/shop',
      text: 'Free shipping and 30-day returns on every order.',
      title: 'Ready to try it?',
    },
    fields: textFields,
    render: ({ buttonLabel, buttonUrl, text, title }) => (
      <CallToActionBlock
        {...({
          blockType: 'cta',
          links: button(buttonLabel, buttonUrl),
          richText: rich(h('h3', title || ''), ...(text ? [p(text)] : [])),
        } as any)}
      />
    ),
  }),

  form: element({
    label: 'Form',
    fields: { form: docField('forms', 'Form') },
    render: ({ form, id, puck }) =>
      form?.fields ? (
        <div className={puck?.isEditing ? 'sfb-inert' : undefined}>
          <FormBlock enableIntro={false} form={form} key={`${id}-${form.id}`} />
        </div>
      ) : (
        <Placeholder>Choose a form in the Content tab</Placeholder>
      ),
  }),

  posts: element({
    label: 'Latest Posts',
    defaults: { limit: 3, posts: [], title: 'From the blog' },
    fields: {
      title: { type: 'text', label: 'Section title' },
      limit: { type: 'number', label: 'Number of posts', max: 12, min: 1 },
    },
    // Loads the newest posts while editing; the site refreshes them on every render.
    resolveData: async (data: any, { changed, trigger }: any) => {
      if (trigger === 'replace' && !changed?.limit) return data
      try {
        const res = await fetch(
          `/api/posts?limit=${data.props.limit || 3}&depth=1&sort=-publishedAt&where[_status][equals]=published`,
        )
        const docs = res.ok ? (await res.json()).docs : []
        return { ...data, props: { ...data.props, posts: docs.map(slimPost) } }
      } catch {
        return data
      }
    },
    render: ({ posts, title }) => (
      <>
        {title && (
          <div className="container mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          </div>
        )}
        {posts?.length ? (
          <CollectionArchive posts={posts} />
        ) : (
          <Placeholder>Published blog posts will appear here</Placeholder>
        )}
      </>
    ),
  }),
}

// ── Root: shows the site header in the canvas so pages are edited in context ──

const root = {
  fields: { title: { type: 'text', label: 'Title' } as Field },
  render: ({ children, puck }: any) =>
    puck?.isEditing ? (
      <>
        {puck.metadata?.header && (
          <div className="sfb-inert">
            <HeaderClient data={puck.metadata.header} />
          </div>
        )}
        <div className="pb-24 pt-6">{children}</div>
      </>
    ) : (
      <>{children}</>
    ),
}

const base = { ...custom, ...generated }

const categories = {
  layout: { title: 'Layout', components: ['section', 'columns', 'spacer'] },
  basic: { title: 'Basic', components: ['heading', 'text', 'image', 'buttonGroup', 'videoEmbed'] },
  sections: {
    title: 'Sections',
    components: [
      'storefrontBanner',
      'hero',
      'splitContent',
      'featureGrid',
      'stats',
      'testimonials',
      'faq',
      'pricing',
      'team',
      'logoCloud',
      'cta',
    ],
  },
  store: {
    title: 'Store & content',
    components: ['productGrid', 'promoTiles', 'gallery', 'posts', 'form'],
  },
}

/** Used when editing a global section, and to render one inside a page. */
export const sectionConfig = { categories, components: base, root } as unknown as Config

/** A saved section that is edited once and reused on any number of pages. */
const globalSection = element({
  label: 'Global Section',
  margin: 'none',
  fields: { section: docField('sections', 'Global section') },
  // Always loads the section's current content, so pages never hold a stale copy.
  resolveData: async (data: any, { changed, trigger }: any) => {
    const id = data.props.section?.id
    if (!id) return { ...data, props: { ...data.props, data: undefined } }
    if (trigger === 'replace' && !changed?.section) return data
    try {
      const res = await fetch(`/api/sections/${id}?depth=1`, { credentials: 'include' })
      if (!res.ok) return data
      return { ...data, props: { ...data.props, data: (await res.json()).puckData } }
    } catch {
      return data
    }
  },
  render: ({ data, section }) =>
    data?.content?.length ? (
      <Render config={sectionConfig} data={data} />
    ) : (
      <Placeholder>
        {section?.id
          ? `“${section.title}” is empty — open it from the Visual Builder list to add content`
          : 'Choose a global section in the Content tab'}
      </Placeholder>
    ),
})

export const pageConfig = {
  categories: {
    ...categories,
    layout: { ...categories.layout, components: [...categories.layout.components, 'globalSection'] },
  },
  components: { ...base, globalSection },
  root,
} as unknown as Config
