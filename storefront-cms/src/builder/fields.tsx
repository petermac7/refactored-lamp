'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import type { Field } from '@puckeditor/core'
import type { Field as PayloadField } from 'payload'

import { FieldLabel } from '@puckeditor/core'
import React from 'react'

import { slimMedia } from './shared'

// ── Custom field types ───────────────────────────────────────────────────

export const colorField = (label: string): Field => ({
  type: 'custom',
  label,
  render: ({ field, onChange, value }) => (
    <FieldLabel el="div" label={field.label || label}>
      <div className="sfb-color">
        <input
          aria-label={`${label} picker`}
          onChange={(e) => onChange(e.target.value)}
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'}
        />
        <input
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Default"
          type="text"
          value={value || ''}
        />
        {value && (
          <button aria-label={`Clear ${label}`} onClick={() => onChange('')} type="button">
            ×
          </button>
        )}
      </div>
    </FieldLabel>
  ),
})

/** Picks an image from the Payload media library. */
export const mediaField = (label = 'Image'): Field => ({
  type: 'external',
  label,
  placeholder: 'Choose from media library',
  showSearch: true,
  fetchList: async ({ query }) => {
    const search = query ? `&where[filename][like]=${encodeURIComponent(query)}` : ''
    const res = await fetch(`/api/media?limit=60&depth=0&sort=-createdAt${search}`, {
      credentials: 'include',
    })
    if (!res.ok) return []
    return ((await res.json()).docs || []).map(slimMedia)
  },
  getItemSummary: (item: any) => item?.filename || 'Image',
  mapRow: (row: any) => ({
    preview: (
      <img alt="" src={row.url} style={{ height: 48, objectFit: 'cover', width: 64 }} />
    ) as any,
    filename: row.filename,
    alt: row.alt || '—',
  }),
})

/** Picks a document from a Payload collection (forms, global sections…). */
export const docField = (collection: string, label: string, depth = 0): Field => ({
  type: 'external',
  label,
  placeholder: `Choose ${label.toLowerCase()}`,
  fetchList: async () => {
    const res = await fetch(`/api/${collection}?limit=100&depth=${depth}&sort=title`, {
      credentials: 'include',
    })
    if (!res.ok) return []
    return (await res.json()).docs || []
  },
  getItemSummary: (item: any) => item?.title || label,
  mapProp: (row: any) =>
    collection === 'sections' ? { id: row.id, title: row.title } : row,
  mapRow: (row: any) => ({ title: row.title, id: String(row.id) }),
})

// ── Style and Advanced tabs (the same options on every element) ──────────

const scale = [
  { label: 'None', value: 'none' },
  { label: 'Extra small', value: 'xs' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra large', value: 'xl' },
]

const sizes = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
]

export const styleFields: Record<string, Field> = {
  sBg: colorField('Background color'),
  sText: colorField('Text color'),
  sAlign: {
    type: 'select',
    label: 'Text align',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
  },
  sPadTop: { type: 'select', label: 'Padding top', options: scale },
  sPadBottom: { type: 'select', label: 'Padding bottom', options: scale },
  sPadX: { type: 'select', label: 'Padding left / right', options: scale },
  sRadius: { type: 'select', label: 'Corner radius', options: sizes },
  sShadow: { type: 'select', label: 'Shadow', options: sizes },
}

export const advancedFields: Record<string, Field> = {
  aMarginTop: { type: 'select', label: 'Margin top', options: scale },
  aMarginBottom: { type: 'select', label: 'Margin bottom', options: scale },
  aMaxWidth: {
    type: 'select',
    label: 'Max width',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Narrow (768px)', value: 'narrow' },
      { label: 'Medium (1024px)', value: 'medium' },
      { label: 'Wide (1280px)', value: 'wide' },
    ],
  },
  aHide: {
    type: 'select',
    label: 'Responsive visibility',
    options: [
      { label: 'Show on all devices', value: 'none' },
      { label: 'Hide on mobile', value: 'mobile' },
      { label: 'Hide on desktop', value: 'desktop' },
    ],
  },
  aAnim: {
    type: 'select',
    label: 'Entrance animation',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Fade in', value: 'fade' },
      { label: 'Slide up', value: 'up' },
      { label: 'Zoom in', value: 'zoom' },
    ],
  },
  aId: { type: 'text', label: 'Anchor ID', placeholder: 'e.g. pricing' },
  aClass: { type: 'text', label: 'CSS classes', placeholder: 'my-class another-class' },
}

// ── Payload block fields → Puck fields ───────────────────────────────────

const humanize = (name: string) =>
  name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

const summary = (row: any) =>
  row?.title || row?.name || row?.label || row?.question || row?.quote || row?.value || row?.text || row?.caption || 'Item'

/**
 * Derives the builder's Content-tab fields from a Payload block definition,
 * so each section's fields are declared once (in src/blocks/builder/config.ts).
 */
export const fieldsFromPayload = (
  fields: PayloadField[],
  defaults: Record<string, any> = {},
): Record<string, Field> => {
  const out: Record<string, Field> = {}

  for (const f of fields as any[]) {
    if (f.type === 'row') {
      Object.assign(out, fieldsFromPayload(f.fields, defaults))
      continue
    }
    if (!f.name) continue
    const label = typeof f.label === 'string' ? f.label : humanize(f.name)

    if (f.type === 'text') out[f.name] = { type: 'text', label }
    else if (f.type === 'textarea') out[f.name] = { type: 'textarea', label }
    else if (f.type === 'number')
      out[f.name] = { type: 'number', label, max: f.max, min: f.min, step: f.admin?.step }
    else if (f.type === 'upload') out[f.name] = mediaField(label)
    else if (f.type === 'checkbox')
      out[f.name] = {
        type: 'radio',
        label,
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
      }
    else if (f.type === 'select')
      out[f.name] = {
        type: 'select',
        label,
        options: f.options.map((o: any) =>
          typeof o === 'string' ? { label: humanize(o), value: o } : { label: o.label, value: o.value },
        ),
      }
    else if (f.type === 'array') {
      const first = Array.isArray(defaults[f.name]) ? defaults[f.name][0] : undefined
      out[f.name] = {
        type: 'array',
        label,
        arrayFields: fieldsFromPayload(f.fields, first || {}),
        defaultItemProps: first || {},
        getItemSummary: summary,
        max: f.maxRows,
        min: f.minRows,
      } as Field
    }
  }

  return out
}
