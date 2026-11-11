import type { Metadata } from 'next'

import React from 'react'

import { fontVariables } from '@/fonts'

// The site's own stylesheet: the builder canvas copies it, so pages look exactly like the live site.
import '../(frontend)/globals.css'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Visual Builder',
}

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={fontVariables} data-theme="light" lang="en">
      <body>{children}</body>
    </html>
  )
}
