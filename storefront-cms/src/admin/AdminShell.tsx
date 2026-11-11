import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

import './admin.css'

/** Wraps a custom admin view in Payload's standard layout (sidebar nav, header) and requires a login. */
export const AdminShell: React.FC<
  AdminViewServerProps & { children: React.ReactNode; intro?: string; title: string }
> = ({ children, initPageResult, intro, params, searchParams, title }) => {
  if (!initPageResult.req.user) redirect('/admin/login')

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter className="sfa">
        <h1 className="sfa-title">{title}</h1>
        {intro && <p className="sfa-intro">{intro}</p>}
        {children}
      </Gutter>
    </DefaultTemplate>
  )
}
