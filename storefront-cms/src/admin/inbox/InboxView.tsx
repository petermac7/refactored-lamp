import type { AdminViewServerProps } from 'payload'

import React from 'react'

import { AdminShell } from '../AdminShell'
import { InboxClient } from './InboxClient'

export default function InboxView(props: AdminViewServerProps) {
  return (
    <AdminShell
      {...props}
      intro="Messages sent through the forms on your site. Opening a message marks it as read."
      title="Inbox"
    >
      <InboxClient />
    </AdminShell>
  )
}
